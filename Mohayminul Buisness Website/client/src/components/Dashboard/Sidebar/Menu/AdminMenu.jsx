import MenuItem from "./MenuItem";
import { BsBoxSeam } from "react-icons/bs";
import useAuth from "../../../../hooks/useAuth";
import { MdAddBox, MdCategory, MdEdit, MdViewCarousel } from "react-icons/md";

const AdminMenu = () => {
  const { user } = useAuth();

  if (user?.role !== "admin") {
    return null;
  }

  return (
    <>
      <MenuItem
        icon={MdAddBox}
        label="Add Product"
        address="/dashboard/add-product"
      />
      <MenuItem
        icon={MdEdit}
        label="Update Products"
        address="/dashboard/update-products"
      />

      <MenuItem
        icon={MdCategory}
        label="Manage Categories"
        address="/dashboard/manage-categories"
      />
      <MenuItem
        icon={MdViewCarousel}
        label=" Manage Banners"
        address="/dashboard/manage-banners"
      />

      <MenuItem
        icon={BsBoxSeam}
        label="All Orders"
        address="/dashboard/all-orders"
      />
    </>
  );
};

export default AdminMenu;
