import Container from "../Container";
import axios from "axios";
import {
  AiOutlineMenu,
  AiOutlineDown,
  AiOutlineLeft,
  AiOutlineRight,
  AiOutlineSearch,
  AiOutlineClose,
  AiOutlineShoppingCart,
  AiOutlineHome,
  AiOutlineUser,
  AiOutlineMessage,
} from "react-icons/ai";
import { FaWhatsapp, FaFacebookMessenger } from "react-icons/fa";
import { useEffect, useRef, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { createPortal } from "react-dom";
import { useTranslation } from "react-i18next";
import useAuth from "../../../hooks/useAuth";
import avatarImg from "../../../assets/images/placeholder.jpg";
import logo from "../../../assets/images/web-developer-bd.png";
import { useQuery } from "@tanstack/react-query";
import SearchBar from "../SearchBar/SearchBar";
import useCart from "../../../hooks/useCart";

// ==========================================
// WhatsApp / Messenger config — nijer number/username boso
// ==========================================
const WHATSAPP_NUMBER = "8801XXXXXXXXX"; // country code soho, + ba space chara
const MESSENGER_USERNAME = "yourpageusername"; // m.me/ er pore ja bosbe

// ==========================================
// LANGUAGE TOGGLE — reusable, desktop o mobile duijaygai use hocche
// ==========================================
const LangToggle = ({ i18n, dark }) => {
  const switchLang = (lng) => {
    i18n.changeLanguage(lng);
    localStorage.setItem("lang", lng);
  };

  return (
    <div
      className={`flex items-center rounded-full p-0.5 text-[11px] font-semibold overflow-hidden border ${
        dark ? "border-gray-600 bg-gray-800" : "border-gray-200 bg-white"
      }`}
    >
      <button
        type="button"
        onClick={() => switchLang("bn")}
        className={`px-2.5 py-1.5 rounded-full transition ${
          i18n.language === "bn"
            ? "bg-yellow-500 text-gray-900"
            : dark
              ? "text-gray-300"
              : "text-gray-600"
        }`}
      >
        বাং
      </button>
      <button
        type="button"
        onClick={() => switchLang("en")}
        className={`px-2.5 py-1.5 rounded-full transition ${
          i18n.language === "en"
            ? "bg-yellow-500 text-gray-900"
            : dark
              ? "text-gray-300"
              : "text-gray-600"
        }`}
      >
        EN
      </button>
    </div>
  );
};

const Navbar = () => {
  const { user, logOut } = useAuth();
  const { cartCount, openCart } = useCart();
  const location = useLocation();
  const { t, i18n } = useTranslation();

  const [isOpen, setIsOpen] = useState(false);
  const [categoryOpen, setCategoryOpen] = useState(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false);
  const [mobileAccountOpen, setMobileAccountOpen] = useState(false); // NEW
  const [chatOpen, setChatOpen] = useState(false); // NEW

  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);
  const [expandedMobileCategory, setExpandedMobileCategory] = useState(null);

  const [dropdownPosition, setDropdownPosition] = useState({
    left: 0,
    top: 0,
  });

  // ==========================================
  // SCROLL DIRECTION — top bar hide/show
  // ==========================================

  const [showTopBar, setShowTopBar] = useState(true); // NEW
  const lastScrollY = useRef(0);

  useEffect(() => {
    let ticking = false;

    const handleScroll = () => {
      if (ticking) return;

      window.requestAnimationFrame(() => {
        const currentScrollY = window.scrollY;

        if (currentScrollY < 80) {
          // page-er upore thakle always top bar dekhabe
          setShowTopBar(true);
        } else if (currentScrollY > lastScrollY.current + 5) {
          // niche scroll hocche -> top bar lukiye jabe
          setShowTopBar(false);
        } else if (currentScrollY < lastScrollY.current - 5) {
          // upore scroll hocche -> top bar abar dekhabe
          setShowTopBar(true);
        }

        lastScrollY.current = currentScrollY;
        ticking = false;
      });

      ticking = true;
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // ==========================================
  // DESKTOP vs MOBILE DETECT (md breakpoint = 768px)
  // ==========================================

  const [isDesktop, setIsDesktop] = useState(
    typeof window !== "undefined" ? window.innerWidth >= 768 : true,
  );

  useEffect(() => {
    const handleResize = () => {
      setIsDesktop(window.innerWidth >= 768);
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const categoryScrollRef = useRef(null);
  const dropdownTimeoutRef = useRef(null);

  // ==========================================
  // GET CATEGORIES
  // ==========================================

  const {
    data: categories = [],
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["categories"],

    queryFn: async () => {
      const { data } = await axios.get(
        `${import.meta.env.VITE_API_URL}/categories`,
      );

      return data;
    },
  });

  const mainCategories = [...categories].sort(
    (a, b) => (a.order || 9999) - (b.order || 9999),
  );

  // ==========================================
  // ACTIVE PATH CHECK (kon page e achi)
  // ==========================================

  const isPathActive = (path) => {
    if (path === "/") {
      return location.pathname === "/";
    }
    return (
      location.pathname === path || location.pathname.startsWith(path + "/")
    );
  };

  const isCategoryActive = (categoryName) => {
    const decodedPath = decodeURIComponent(location.pathname);
    return (
      decodedPath === `/products/category/${categoryName}` ||
      decodedPath.startsWith(`/products/category/${categoryName}/`)
    );
  };

  const isSubCategoryActive = (categoryName, subCategoryName) => {
    const decodedPath = decodeURIComponent(location.pathname);
    return (
      decodedPath === `/products/category/${categoryName}/${subCategoryName}`
    );
  };

  // ==========================================
  // UPDATE ARROWS
  // ==========================================

  const updateScrollButtons = () => {
    const element = categoryScrollRef.current;

    if (!element) return;

    const { scrollLeft, scrollWidth, clientWidth } = element;

    setCanScrollLeft(scrollLeft > 5);

    setCanScrollRight(scrollLeft + clientWidth < scrollWidth - 5);
  };

  // ==========================================
  // SCROLL LISTENER
  // ==========================================

  useEffect(() => {
    const element = categoryScrollRef.current;

    if (!element) return;

    updateScrollButtons();

    element.addEventListener("scroll", updateScrollButtons);
    window.addEventListener("resize", updateScrollButtons);

    return () => {
      element.removeEventListener("scroll", updateScrollButtons);

      window.removeEventListener("resize", updateScrollButtons);
    };
  }, [categories]);

  // ==========================================
  // SCROLL LEFT
  // ==========================================

  const scrollLeft = () => {
    categoryScrollRef.current?.scrollBy({
      left: -250,
      behavior: "smooth",
    });
  };

  // ==========================================
  // SCROLL RIGHT
  // ==========================================

  const scrollRight = () => {
    categoryScrollRef.current?.scrollBy({
      left: 250,
      behavior: "smooth",
    });
  };

  // ==========================================
  // DESKTOP: OPEN DROPDOWN ON HOVER
  // ==========================================

  const handleCategoryEnter = (event, categoryId) => {
    if (!isDesktop) return; // mobile e hover kaj korbe na

    clearTimeout(dropdownTimeoutRef.current);

    const rect = event.currentTarget.getBoundingClientRect();

    setDropdownPosition({
      left: rect.left,
      top: rect.bottom,
    });

    setCategoryOpen(categoryId);
  };

  // ==========================================
  // DESKTOP: CLOSE DROPDOWN ON MOUSE LEAVE (delay soho)
  // ==========================================

  const handleCategoryLeave = () => {
    if (!isDesktop) return;

    dropdownTimeoutRef.current = setTimeout(() => {
      setCategoryOpen(null);
    }, 150);
  };

  // ==========================================
  // DESKTOP: KEEP DROPDOWN OPEN JODI DROPDOWN E MOUSE THAKE
  // ==========================================

  const handleDropdownEnter = () => {
    if (!isDesktop) return;
    clearTimeout(dropdownTimeoutRef.current);
  };

  const handleDropdownLeave = () => {
    if (!isDesktop) return;
    setCategoryOpen(null);
  };

  // ==========================================
  // MOBILE: TOGGLE DROPDOWN ON CLICK
  // ==========================================

  const handleCategoryClick = (event, categoryId) => {
    if (isDesktop) return; // desktop e click kaj korbe na, hover e already hocche

    event.stopPropagation();

    const rect = event.currentTarget.getBoundingClientRect();

    setDropdownPosition({
      left: rect.left,
      top: rect.bottom,
    });

    setCategoryOpen((prev) => (prev === categoryId ? null : categoryId));
  };

  // ==========================================
  // MOBILE: CLOSE DROPDOWN ON OUTSIDE CLICK
  // ==========================================

  useEffect(() => {
    if (isDesktop) return; // desktop e eta lagbe na
    if (!categoryOpen) return;

    const handleClickOutside = () => {
      setCategoryOpen(null);
    };

    document.addEventListener("click", handleClickOutside);

    return () => {
      document.removeEventListener("click", handleClickOutside);
    };
  }, [categoryOpen, isDesktop]);

  // ==========================================
  // CURRENT DROPDOWN CATEGORY
  // ==========================================

  const activeCategory = mainCategories.find(
    (item) => item._id === categoryOpen,
  );

  // ==========================================
  // BOTTOM NAV: SEARCH ICON click
  // ==========================================

  const handleBottomSearchClick = () => {
    setShowTopBar(true); // top bar hidden thakle abar dekhabe
    setMobileSearchOpen(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <>
      {/* =====================================================
          TOP NAVBAR + CATEGORY NAVBAR — ekta sticky wrapper e
      ===================================================== */}

      <div
        className={`
         
    fixed
    top-0
    left-0
    right-0
    z-[50000]
    transition-transform
    duration-300
    ${showTopBar ? "translate-y-0" : "-translate-y-full"}
  `}
      >
        {/* ================= TOP BAR (scroll e hide/show hoy) ================= */}
        <div
          className={`grid transition-[grid-template-rows] duration-300 ease-in-out ${
            showTopBar ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
          }`}
        >
          <div className="overflow-hidden">
            <div className="bg-white border-b">
              <Container>
                <div className="flex items-center justify-between gap-3 py-3">
                  {/* LOGO */}

                  <Link to="/" className="flex-shrink-0">
                    <img
                      src={logo}
                      alt="web developer"
                      className="w-40 md:w-52"
                    />
                  </Link>

                  {/* SEARCH BAR - DESKTOP (logo আর user menu এর মাঝখানে) */}

                  <div className="hidden md:block flex-1 max-w-xl">
                    <SearchBar />
                  </div>

                  {/* RIGHT SIDE */}

                  <div className="flex items-center gap-2 flex-shrink-0">
                    {/* LANGUAGE TOGGLE — DESKTOP */}

                    <div className="hidden md:flex">
                      <LangToggle i18n={i18n} />
                    </div>

                    {/* MOBILE SEARCH TOGGLE BUTTON */}

                    <button
                      type="button"
                      onClick={() => setMobileSearchOpen((prev) => !prev)}
                      className="
                        md:hidden
                        p-2.5
                        border
                        border-gray-200
                        rounded-full
                        hover:shadow-md
                        transition
                        bg-white
                      "
                    >
                      {mobileSearchOpen ? (
                        <AiOutlineClose size={18} className="text-gray-700" />
                      ) : (
                        <AiOutlineSearch size={18} className="text-gray-700" />
                      )}
                    </button>

                    {/* CART ICON */}
                    <button
                      type="button"
                      onClick={openCart}
                      className="
                        relative
                        p-2.5
                        border
                        border-gray-200
                        rounded-full
                        hover:shadow-md
                        transition
                        bg-white
                      "
                    >
                      <AiOutlineShoppingCart
                        size={20}
                        className="text-gray-700"
                      />

                      {cartCount > 0 && (
                        <span
                          className="
                            absolute
                            -top-1.5
                            -right-1.5
                            bg-yellow-500
                            text-white
                            text-[10px]
                            font-bold
                            w-5
                            h-5
                            flex
                            items-center
                            justify-center
                            rounded-full
                          "
                        >
                          {cartCount > 9 ? "9+" : cartCount}
                        </span>
                      )}
                    </button>

                    {/* USER MENU — DESKTOP ONLY, mobile e bottom nav e "Account" ache */}

                    <div className="relative z-[999999] hidden md:block">
                      {/* USER BUTTON */}
                      <button
                        type="button"
                        onClick={() => setIsOpen((prev) => !prev)}
                        className="
      p-2
      md:px-2
      border
      border-gray-200
      flex
      items-center
      gap-2
      md:gap-3
      rounded-full
      cursor-pointer
      hover:shadow-md
      transition
      bg-white
    "
                      >
                        <img
                          className="rounded-full object-cover"
                          referrerPolicy="no-referrer"
                          src={user?.photoURL ? user.photoURL : avatarImg}
                          alt="profile"
                          width="30"
                          height="30"
                        />

                        <AiOutlineMenu size={18} className="text-gray-700" />
                      </button>

                      {/* USER DROPDOWN - PORTAL */}
                      {isOpen &&
                        createPortal(
                          <div
                            className="
          fixed
          w-48
          bg-white
          shadow-2xl
          rounded-lg
          border
          border-gray-200
          overflow-hidden
          z-[99999999]
        "
                            style={{
                              top: "70px",
                              right: "20px",
                            }}
                          >
                            {/* HOME */}
                            <Link
                              to="/"
                              onClick={() => setIsOpen(false)}
                              className={`
            block
            px-4
            py-3
            font-semibold
            hover:bg-yellow-50
            hover:text-yellow-600
            ${isPathActive("/") ? "bg-yellow-50 text-yellow-600" : ""}
          `}
                            >
                              {t("nav.home")}
                            </Link>

                            {user ? (
                              <>
                                {/* DASHBOARD */}
                                <Link
                                  to={
                                    user?.role === "admin"
                                      ? "/dashboard/all-orders"
                                      : "/dashboard/my-orders"
                                  }
                                  onClick={() => setIsOpen(false)}
                                  className={`
                block
                px-4
                py-3
                font-semibold
                hover:bg-yellow-50
                hover:text-yellow-600
                ${
                  isPathActive("/dashboard")
                    ? "bg-yellow-50 text-yellow-600"
                    : ""
                }
              `}
                                >
                                  {t("nav.dashboard")}
                                </Link>

                                {/* LOGOUT */}
                                <button
                                  type="button"
                                  onClick={() => {
                                    logOut();
                                    setIsOpen(false);
                                  }}
                                  className="
                w-full
                text-left
                px-4
                py-3
                font-semibold
                hover:bg-yellow-50
                hover:text-yellow-600
              "
                                >
                                  {t("nav.logout")}
                                </button>
                              </>
                            ) : (
                              <>
                                {/* LOGIN */}
                                <Link
                                  to="/login"
                                  onClick={() => setIsOpen(false)}
                                  className={`
                block
                px-4
                py-3
                font-semibold
                hover:bg-yellow-50
                hover:text-yellow-600
                ${isPathActive("/login") ? "bg-yellow-50 text-yellow-600" : ""}
              `}
                                >
                                  {t("nav.login")}
                                </Link>

                                {/* SIGN UP */}
                                <Link
                                  to="/signup"
                                  onClick={() => setIsOpen(false)}
                                  className={`
                block
                px-4
                py-3
                font-semibold
                hover:bg-yellow-50
                hover:text-yellow-600
                ${isPathActive("/signup") ? "bg-yellow-50 text-yellow-600" : ""}
              `}
                                >
                                  {t("nav.signup")}
                                </Link>
                              </>
                            )}
                          </div>,
                          document.body,
                        )}
                    </div>
                  </div>
                </div>

                {/* SEARCH BAR - MOBILE (toggle button চাপলে এখানে খুলবে) */}

                {mobileSearchOpen && (
                  <div className="md:hidden pb-3">
                    <SearchBar />
                  </div>
                )}
              </Container>
            </div>
          </div>
        </div>

        {/* ================= CATEGORY NAVBAR (always visible, sticky) ================= */}

        <div className="bg-gray-900 text-white">
          <Container>
            <div className="flex items-center min-w-0">
              {/* HAMBURGER */}

              <button
                type="button"
                onClick={() => setMobileMenuOpen(true)}
                className="
                  flex-shrink-0
                  p-2
                  mr-3
                  sm:mr-2
                  hover:text-yellow-400
                  transition
                "
              >
                <AiOutlineMenu size={21} />
              </button>

              {/* LEFT ARROW */}

              {canScrollLeft && (
                <button
                  type="button"
                  onClick={scrollLeft}
                  className="
                    flex
                    flex-shrink-0
                    items-center
                    justify-center
                    w-8
                    h-8
                    rounded-full
                    hover:text-yellow-400
                    hover:bg-gray-800
                    transition
                  "
                >
                  <AiOutlineLeft size={17} />
                </button>
              )}

              {/* =================================================
                  ONLY THIS AREA SCROLLS
              ================================================= */}

              <div
                ref={categoryScrollRef}
                className="
                  flex
                  items-center
                  gap-5
                  sm:gap-6
                  md:gap-8
                  overflow-x-auto
                  flex-1
                  min-w-0
                  scrollbar-hide
                  scroll-smooth
                "
                style={{
                  scrollbarWidth: "none",
                  msOverflowStyle: "none",
                }}
              >
                {/* HOME */}

                <Link
                  to="/"
                  className={`
                    flex-shrink-0
                    py-4
                    md:ml-5
                    whitespace-nowrap
                    font-medium
                    text-sm
                    md:text-base
                    hover:text-yellow-400
                    ${isPathActive("/") ? "text-yellow-400" : ""}
                  `}
                >
                  {t("nav.home")}
                </Link>

                {/* MAIN CATEGORIES */}

                {!isLoading &&
                  !isError &&
                  mainCategories.map((mainCategory) => {
                    const active = isCategoryActive(mainCategory.name);
                    const hasSub = mainCategory.subcategories?.length > 0;

                    return (
                      <div
                        key={mainCategory._id}
                        className="flex-shrink-0"
                        onMouseEnter={(e) =>
                          hasSub && handleCategoryEnter(e, mainCategory._id)
                        }
                        onMouseLeave={handleCategoryLeave}
                      >
                        {hasSub ? (
                          <button
                            type="button"
                            onClick={(e) =>
                              handleCategoryClick(e, mainCategory._id)
                            }
                            className={`
                              flex
                              items-center
                              gap-1.5
                              py-4
                              whitespace-nowrap
                              font-medium
                              text-sm
                              md:text-base
                              hover:text-yellow-400
                              transition
                              ${active ? "text-yellow-400" : ""}
                            `}
                          >
                            {mainCategory.name}
                            <AiOutlineDown
                              size={11}
                              className={`transition-transform ${
                                categoryOpen === mainCategory._id
                                  ? "rotate-180"
                                  : ""
                              }`}
                            />
                          </button>
                        ) : (
                          <Link
                            to={`/products/category/${encodeURIComponent(
                              mainCategory.name,
                            )}`}
                            className={`
                              flex
                              items-center
                              gap-1.5
                              py-4
                              whitespace-nowrap
                              font-medium
                              text-sm
                              md:text-base
                              hover:text-yellow-400
                              transition
                              ${active ? "text-yellow-400" : ""}
                            `}
                          >
                            {mainCategory.name}
                          </Link>
                        )}
                      </div>
                    );
                  })}
              </div>

              {/* RIGHT ARROW */}

              {canScrollRight && (
                <button
                  type="button"
                  onClick={scrollRight}
                  className="
                    flex
                    flex-shrink-0
                    items-center
                    justify-center
                    w-8
                    h-8
                    rounded-full
                    hover:text-yellow-400
                    hover:bg-gray-800
                    transition
                  "
                >
                  <AiOutlineRight size={17} />
                </button>
              )}
            </div>
          </Container>
        </div>
      </div>

      {/* =====================================================
          CATEGORY DROPDOWN
          
          Desktop -> hover e open/close (delay soho)
          Mobile  -> click e open/close, baire click korle close
      ===================================================== */}

      {activeCategory &&
        activeCategory.subcategories?.length > 0 &&
        createPortal(
          <div
            onMouseEnter={handleDropdownEnter}
            onMouseLeave={handleDropdownLeave}
            onClick={(e) => e.stopPropagation()}
            className="
              fixed
              w-56
              bg-white
              text-gray-800
              rounded-md
              shadow-2xl
              border
              border-gray-200
              overflow-hidden
              z-[9999999]
            "
            style={{
              left: dropdownPosition.left,
              top: dropdownPosition.top,
            }}
          >
            {/* ALL MAIN CATEGORY */}

            <Link
              to={`/products/category/${encodeURIComponent(
                activeCategory.name,
              )}`}
              onClick={() => setCategoryOpen(null)}
              className={`
                block
                px-4
                py-3
                font-semibold
                border-b
                border-gray-100
                hover:bg-yellow-50
                hover:text-yellow-600
                transition
                ${
                  decodeURIComponent(location.pathname) ===
                  `/products/category/${activeCategory.name}`
                    ? "bg-yellow-50 text-yellow-600"
                    : ""
                }
              `}
            >
              {t("nav.all")} {activeCategory.name}
            </Link>

            {/* SUB CATEGORIES */}

            {activeCategory.subcategories.map((subCategory) => {
              const subActive = isSubCategoryActive(
                activeCategory.name,
                subCategory.name,
              );

              return (
                <Link
                  key={subCategory._id}
                  to={`/products/category/${encodeURIComponent(
                    activeCategory.name,
                  )}/${encodeURIComponent(subCategory.name)}`}
                  onClick={() => setCategoryOpen(null)}
                  className={`
                    block
                    px-4
                    py-3
                    text-sm
                    hover:bg-yellow-50
                    hover:text-yellow-600
                    transition
                    ${subActive ? "bg-yellow-50 text-yellow-600" : ""}
                  `}
                >
                  {subCategory.name}
                </Link>
              );
            })}
          </div>,
          document.body,
        )}

      {/* =====================================================
          MOBILE SIDE MENU (Hamburger Drawer)
          FIX: full-screen overlay e click korleo bondho hobe
      ===================================================== */}

      {mobileMenuOpen && (
        <div className="fixed inset-0 z-[99999999]">
          {/* OVERLAY — body-r jekono jaygai click korle bondho hobe */}

          <div
            onClick={() => {
              setMobileMenuOpen(false);
              setExpandedMobileCategory(null);
            }}
            className="absolute inset-0 bg-black/50"
          />

          {/* DRAWER */}

          <div
            className="
              absolute
              left-0
              top-0
              bottom-0
              w-[300px]
              max-w-[85%]
              bg-white
              shadow-2xl
              overflow-y-auto
            "
          >
            {/* HEADER */}

            <div
              className="
                sticky
                top-0
                z-30
                bg-gray-900
                text-white
                px-5
                py-4
                flex
                items-center
                justify-between
                gap-3
              "
            >
              <h2 className="font-semibold text-lg">{t("nav.categories")}</h2>

              <div className="flex items-center gap-3">
                {/* LANGUAGE TOGGLE — MOBILE DRAWER */}
                <LangToggle i18n={i18n} dark />

                <button
                  type="button"
                  onClick={() => {
                    setMobileMenuOpen(false);
                    setExpandedMobileCategory(null);
                  }}
                  className="
                    text-2xl
                    hover:text-yellow-400
                  "
                >
                  ×
                </button>
              </div>
            </div>

            {/* HOME */}

            <Link
              to="/"
              onClick={() => setMobileMenuOpen(false)}
              className={`
                block
                px-5
                py-4
                border-b
                hover:bg-yellow-50
                hover:text-yellow-600
                ${isPathActive("/") ? "bg-yellow-50 text-yellow-600" : ""}
              `}
            >
              {t("nav.home")}
            </Link>

            {/* SHOP ALL */}

            <Link
              to="/products"
              onClick={() => setMobileMenuOpen(false)}
              className={`
                block
                px-5
                py-4
                border-b
                hover:bg-yellow-50
                hover:text-yellow-600
                ${isPathActive("/products") ? "bg-yellow-50 text-yellow-600" : ""}
              `}
            >
              {t("nav.shopAll")}
            </Link>

            {/* MAIN CATEGORIES */}

            {mainCategories.map((mainCategory) => {
              const mainActive = isCategoryActive(mainCategory.name);
              const hasSub = mainCategory.subcategories?.length > 0;
              const isExpanded = expandedMobileCategory === mainCategory._id;

              return (
                <div key={mainCategory._id} className="border-b">
                  {/* MAIN CATEGORY ROW: naam (link) + arrow (toggle) alada */}
                  <div
                    className={`
                      flex
                      items-center
                      justify-between
                      px-5
                      py-4
                      font-semibold
                      hover:bg-yellow-50
                      hover:text-yellow-600
                      ${mainActive ? "bg-yellow-50 text-yellow-600" : ""}
                    `}
                  >
                    <Link
                      to={`/products/category/${encodeURIComponent(mainCategory.name)}`}
                      onClick={() => {
                        setMobileMenuOpen(false);
                        setExpandedMobileCategory(null);
                      }}
                      className="flex-1"
                    >
                      {mainCategory.name}
                    </Link>

                    {hasSub && (
                      <button
                        type="button"
                        onClick={() =>
                          setExpandedMobileCategory((prev) =>
                            prev === mainCategory._id ? null : mainCategory._id,
                          )
                        }
                        className="p-1 -mr-1"
                      >
                        <AiOutlineDown
                          size={14}
                          className={`transition-transform ${
                            isExpanded ? "rotate-180" : ""
                          }`}
                        />
                      </button>
                    )}
                  </div>

                  {/* SUB CATEGORIES: shudhu tokhoni dekhabe jokhon expand kora hoyeche */}
                  {hasSub && isExpanded && (
                    <div className="bg-gray-50">
                      <Link
                        to={`/products/category/${encodeURIComponent(mainCategory.name)}`}
                        onClick={() => {
                          setMobileMenuOpen(false);
                          setExpandedMobileCategory(null);
                        }}
                        className={`
                          block
                          px-8
                          py-3
                          text-sm
                          font-semibold
                          text-yellow-600
                          hover:bg-yellow-50
                          ${
                            decodeURIComponent(location.pathname) ===
                            `/products/category/${mainCategory.name}`
                              ? "bg-yellow-100"
                              : ""
                          }
                        `}
                      >
                        {t("nav.all")} {mainCategory.name}
                      </Link>

                      {mainCategory.subcategories.map((subCategory) => {
                        const subActive = isSubCategoryActive(
                          mainCategory.name,
                          subCategory.name,
                        );

                        return (
                          <Link
                            key={subCategory._id}
                            to={`/products/category/${encodeURIComponent(
                              mainCategory.name,
                            )}/${encodeURIComponent(subCategory.name)}`}
                            onClick={() => {
                              setMobileMenuOpen(false);
                              setExpandedMobileCategory(null);
                            }}
                            className={`
                              block
                              px-8
                              py-3
                              text-sm
                              text-gray-600
                              hover:bg-yellow-50
                              hover:text-yellow-600
                              ${subActive ? "bg-yellow-50 text-yellow-600" : ""}
                            `}
                          >
                            {subCategory.name}
                          </Link>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* =====================================================
          MOBILE ACCOUNT BOTTOM SHEET
          Bottom nav "Account" e click korle upore utha
      ===================================================== */}

      {mobileAccountOpen && (
        <div className="fixed inset-0 z-[99999999] md:hidden">
          <div
            onClick={() => setMobileAccountOpen(false)}
            className="absolute inset-0 bg-black/50"
          />

          <div className="absolute left-0 right-0 bottom-0 bg-white rounded-t-2xl shadow-2xl overflow-hidden">
            {/* HEADER */}
            <div className="flex items-center justify-between px-5 py-4 border-b">
              <div className="flex items-center gap-3">
                <img
                  className="rounded-full object-cover"
                  referrerPolicy="no-referrer"
                  src={user?.photoURL ? user.photoURL : avatarImg}
                  alt="profile"
                  width="38"
                  height="38"
                />
                <span className="font-semibold">
                  {user?.displayName || t("nav.guest")}
                </span>
              </div>

              <div className="flex items-center gap-3">
                <LangToggle i18n={i18n} />

                <button
                  type="button"
                  onClick={() => setMobileAccountOpen(false)}
                  className="text-2xl hover:text-yellow-500"
                >
                  ×
                </button>
              </div>
            </div>

            <Link
              to="/"
              onClick={() => setMobileAccountOpen(false)}
              className="block px-5 py-4 border-b font-medium hover:bg-yellow-50 hover:text-yellow-600"
            >
              {t("nav.home")}
            </Link>

            {user ? (
              <>
                <Link
                  to={
                    user?.role === "admin"
                      ? "/dashboard/all-orders"
                      : "/dashboard/my-orders"
                  }
                  onClick={() => setMobileAccountOpen(false)}
                  className="block px-5 py-4 border-b font-medium hover:bg-yellow-50 hover:text-yellow-600"
                >
                  {t("nav.dashboard")}
                </Link>

                <button
                  type="button"
                  onClick={() => {
                    logOut();
                    setMobileAccountOpen(false);
                  }}
                  className="w-full text-left px-5 py-4 font-medium hover:bg-yellow-50 hover:text-yellow-600 pb-6"
                >
                  {t("nav.logout")}
                </button>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  onClick={() => setMobileAccountOpen(false)}
                  className="block px-5 py-4 border-b font-medium hover:bg-yellow-50 hover:text-yellow-600"
                >
                  {t("nav.login")}
                </Link>

                <Link
                  to="/signup"
                  onClick={() => setMobileAccountOpen(false)}
                  className="block px-5 py-4 font-medium hover:bg-yellow-50 hover:text-yellow-600 pb-6"
                >
                  {t("nav.signup")}
                </Link>
              </>
            )}
          </div>
        </div>
      )}

      {/* =====================================================
          BOTTOM MOBILE NAV BAR (ghorerbazar.com style)
      ===================================================== */}

      <div
        className="
          md:hidden
          fixed
          bottom-0
          left-0
          right-0
          z-[999999]
          bg-white
          border-t
          border-gray-200
          shadow-[0_-2px_10px_rgba(0,0,0,0.08)]
        "
      >
        <div className="grid grid-cols-5">
          {/* HOME */}
          <Link
            to="/"
            className={`flex flex-col items-center justify-center py-2 gap-0.5 ${
              isPathActive("/") ? "text-yellow-600" : "text-gray-600"
            }`}
          >
            <AiOutlineHome size={20} />
            <span className="text-[10px] font-medium">{t("nav.home")}</span>
          </Link>

          {/* MENU (category drawer) */}
          <button
            type="button"
            onClick={() => setMobileMenuOpen(true)}
            className="flex flex-col items-center justify-center py-2 gap-0.5 text-gray-600"
          >
            <AiOutlineMenu size={20} />
            <span className="text-[10px] font-medium">{t("nav.menu")}</span>
          </button>

          {/* CART */}
          <button
            type="button"
            onClick={openCart}
            className="relative flex flex-col items-center justify-center py-2 gap-0.5 text-gray-600"
          >
            <AiOutlineShoppingCart size={20} />

            {cartCount > 0 && (
              <span
                className="
                  absolute
                  top-0.5
                  right-[26%]
                  bg-yellow-500
                  text-white
                  text-[9px]
                  font-bold
                  w-4
                  h-4
                  flex
                  items-center
                  justify-center
                  rounded-full
                "
              >
                {cartCount > 9 ? "9+" : cartCount}
              </span>
            )}

            <span className="text-[10px] font-medium">{t("nav.cart")}</span>
          </button>

          {/* SEARCH */}
          <button
            type="button"
            onClick={handleBottomSearchClick}
            className="flex flex-col items-center justify-center py-2 gap-0.5 text-gray-600"
          >
            <AiOutlineSearch size={20} />
            <span className="text-[10px] font-medium">{t("nav.search")}</span>
          </button>

          {/* ACCOUNT */}
          <button
            type="button"
            onClick={() => setMobileAccountOpen(true)}
            className="flex flex-col items-center justify-center py-2 gap-0.5 text-gray-600"
          >
            <AiOutlineUser size={20} />
            <span className="text-[10px] font-medium">{t("nav.account")}</span>
          </button>
        </div>
      </div>

      {/* =====================================================
          FLOATING WHATSAPP / MESSENGER CHAT BUTTON
      ===================================================== */}

      <div className="fixed bottom-20 md:bottom-6 right-4 md:right-6 z-[9999998] flex flex-col items-end gap-3">
        {chatOpen && (
          <div className="flex flex-col gap-3 mb-1">
            {/* WhatsApp */}
            <a
              href={`https://wa.me/${WHATSAPP_NUMBER}`}
              target="_blank"
              rel="noopener noreferrer"
              title="WhatsApp"
              className="w-12 h-12 rounded-full bg-green-500 hover:bg-green-600 text-white flex items-center justify-center shadow-lg transition"
            >
              <FaWhatsapp size={22} />
            </a>

            {/* Messenger */}
            <a
              href={`https://m.me/${MESSENGER_USERNAME}`}
              target="_blank"
              rel="noopener noreferrer"
              title="Messenger"
              className="w-12 h-12 rounded-full bg-blue-500 hover:bg-blue-600 text-white flex items-center justify-center shadow-lg transition"
            >
              <FaFacebookMessenger size={22} />
            </a>
          </div>
        )}

        <button
          type="button"
          onClick={() => setChatOpen((prev) => !prev)}
          className="w-14 h-14 rounded-full bg-pink-500 hover:bg-pink-600 text-white flex items-center justify-center shadow-xl transition"
        >
          {chatOpen ? (
            <AiOutlineClose size={24} />
          ) : (
            <AiOutlineMessage size={24} />
          )}
        </button>
      </div>
    </>
  );
};

export default Navbar;
