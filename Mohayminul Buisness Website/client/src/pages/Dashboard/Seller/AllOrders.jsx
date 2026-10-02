import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import PropTypes from "prop-types";
import toast from "react-hot-toast";
import useAxiosSecure from "../../../hooks/useAxiosSecure";
import LoadingSpinner from "../../../components/Shared/LoadingSpinner";
import { FiPhone, FiTrash2 } from "react-icons/fi";

const NAME_CHAR_LIMIT = 22;

// ================= REUSABLE: PRODUCT NAME (truncate + See more) =================
const ProductName = ({ name }) => {
  const [expanded, setExpanded] = useState(false);

  const safeName = name || "";
  const isLong = safeName.length > NAME_CHAR_LIMIT;
  const displayName =
    expanded || !isLong ? safeName : `${safeName.slice(0, NAME_CHAR_LIMIT)}...`;

  return (
    <span className="text-xs md:text-sm">
      {displayName}
      {isLong && (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            setExpanded((prev) => !prev);
          }}
          className="text-blue-600 hover:text-blue-800 ml-1 text-xs font-medium underline"
        >
          {expanded ? "See less" : "See more"}
        </button>
      )}
    </span>
  );
};

ProductName.propTypes = {
  name: PropTypes.string,
};

// ================= REUSABLE: PRODUCT(S) DISPLAY (naam + image, quantity NAI) =================
const ProductsDisplay = ({ order }) => {
  const isMultiProduct = Array.isArray(order.products);

  if (isMultiProduct) {
    return (
      <div className="space-y-2">
        {order.products.map((item, index) => (
          <div
            key={index}
            className="flex flex-col items-center gap-1 text-center"
          >
            <img
              src={item.image}
              alt={item.name}
              className="w-10 h-10 rounded object-cover flex-shrink-0"
            />
            <ProductName name={item.name} />
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="flex items-center gap-3">
      <img
        src={order.product?.image}
        alt={order.product?.name}
        className="w-12 h-12 rounded object-cover flex-shrink-0"
      />
      <ProductName name={order.product?.name} />
    </div>
  );
};

ProductsDisplay.propTypes = {
  order: PropTypes.shape({
    products: PropTypes.array,
    product: PropTypes.shape({
      image: PropTypes.string,
      name: PropTypes.string,
    }),
  }).isRequired,
};

// ================= REUSABLE: QUANTITY DISPLAY (alada field) =================
const QuantityDisplay = ({ order }) => {
  const isMultiProduct = Array.isArray(order.products);

  if (isMultiProduct) {
    return (
      <div className="space-y-2">
        {order.products.map((item, index) => (
          <div
            key={index}
            className="h-10 flex items-center text-sm font-medium text-gray-700"
          >
            {item.quantity}
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="text-sm font-medium text-gray-700">
      {order.quantity || 1}
    </div>
  );
};

QuantityDisplay.propTypes = {
  order: PropTypes.shape({
    products: PropTypes.array,
    quantity: PropTypes.number,
  }).isRequired,
};

// ================= REUSABLE: PAYMENT DISPLAY =================
const PaymentDisplay = ({ order }) => (
  <>
    <span className="capitalize font-medium">
      {order.paymentMethod === "instant"
        ? "Instant Payment"
        : "Cash on Delivery"}
    </span>

    {order.paymentMethod === "instant" && order.paymentDetails && (
      <div className="mt-2 text-xs text-gray-600 space-y-1">
        <p>
          <span className="font-medium">Number:</span>{" "}
          {order.paymentDetails.number}
        </p>
        <p>
          <span className="font-medium">Txn ID:</span>{" "}
          {order.paymentDetails.transactionId}
        </p>
        {order.paymentDetails.screenshot && (
          <a
            href={order.paymentDetails.screenshot}
            target="_blank"
            rel="noopener noreferrer"
          >
            <img
              src={order.paymentDetails.screenshot}
              alt="Payment proof"
              className="w-14 h-14 object-cover rounded border mt-1"
            />
          </a>
        )}
      </div>
    )}
  </>
);

PaymentDisplay.propTypes = {
  order: PropTypes.shape({
    paymentMethod: PropTypes.string,
    paymentDetails: PropTypes.shape({
      number: PropTypes.string,
      transactionId: PropTypes.string,
      screenshot: PropTypes.string,
    }),
  }).isRequired,
};

// ================= REUSABLE: STATUS SELECT =================
// FIX: status "delivered" hole border LAL (red) hoye jabe
const StatusSelect = ({ order, onStatusChange }) => {
  if (order.status === "cancelled") {
    return (
      <span className="px-3 py-2 rounded bg-red-100 text-red-700 text-sm inline-block">
        Cancelled
      </span>
    );
  }

  const isDelivered = order.status === "delivered";

  return (
    <select
      value={order.status || "pending"}
      onChange={(e) => onStatusChange(order._id, e.target.value)}
      className={`px-2 py-1.5 rounded border-2 text-xs bg-white transition-colors max-w-[130px] ${
        isDelivered
          ? "border-red-500 text-red-600 font-semibold"
          : "border-gray-300"
      }`}
    >
      <option value="pending">Pending</option>
      <option value="processing">Start Processing</option>
      <option value="shipped">Delivery Courier</option>
      <option value="delivered">Delivery Complete</option>
    </select>
  );
};

StatusSelect.propTypes = {
  order: PropTypes.shape({
    _id: PropTypes.string,
    status: PropTypes.string,
  }).isRequired,
  onStatusChange: PropTypes.func.isRequired,
};

// ================= REUSABLE: DELETE BUTTON =================
const DeleteButton = ({ orderId, onDelete }) => (
  <button
    type="button"
    onClick={() => onDelete(orderId)}
    title="Delete order"
    className="p-2 rounded-md text-red-500 hover:bg-red-50 hover:text-red-700 transition"
  >
    <FiTrash2 size={16} />
  </button>
);

DeleteButton.propTypes = {
  orderId: PropTypes.string.isRequired,
  onDelete: PropTypes.func.isRequired,
};

// ================= HELPER: FORMAT DATE/TIME (soto/compact) =================
const formatDateTime = (dateValue) => {
  if (!dateValue) return null;

  const date = new Date(dateValue);

  if (isNaN(date.getTime())) return null;

  const datePart = date.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
  });

  const timePart = date.toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });

  return { datePart, timePart };
};

// ================= REUSABLE: SL + DATE/TIME (ekta compact field) =================
const SerialAndDate = ({ index, dateValue }) => {
  const formatted = formatDateTime(dateValue);

  return (
    <div className="text-[11px] leading-tight whitespace-nowrap">
      <p className="font-bold text-xs text-black">#{index + 1}</p>
      {formatted ? (
        <>
          <p className="text-black text-[11px]">{formatted.datePart}</p>
          <p className="text-gray-500 text-[10px]">{formatted.timePart}</p>
        </>
      ) : (
        <p className="text-gray-400">-</p>
      )}
    </div>
  );
};

SerialAndDate.propTypes = {
  index: PropTypes.number.isRequired,
  dateValue: PropTypes.oneOfType([
    PropTypes.string,
    PropTypes.instanceOf(Date),
  ]),
};

// ================= HELPER: DATE RANGE FILTER =================
const startOfToday = () => {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d;
};

const startOfThisWeek = () => {
  const d = startOfToday();
  const day = d.getDay(); // 0 = Sunday
  const diffToMonday = day === 0 ? 6 : day - 1; // Monday k week-er shuru dhora hoyeche
  d.setDate(d.getDate() - diffToMonday);
  return d;
};

const startOfThisMonth = () => {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth(), 1);
};

const FILTER_OPTIONS = [
  { value: "all", label: "All" },
  { value: "today", label: "Today" },
  { value: "week", label: "This Week" },
  { value: "month", label: "This Month" },
];

const filterOrdersByDate = (orders, filter) => {
  if (filter === "all") return orders;

  let rangeStart;

  if (filter === "today") rangeStart = startOfToday();
  else if (filter === "week") rangeStart = startOfThisWeek();
  else if (filter === "month") rangeStart = startOfThisMonth();
  else return orders;

  return orders.filter((order) => {
    if (!order.createdAt) return false;

    const created = new Date(order.createdAt);

    if (isNaN(created.getTime())) return false;

    return created >= rangeStart;
  });
};

// ================= MAIN COMPONENT =================
const AllOrders = () => {
  const axiosSecure = useAxiosSecure();
  const queryClient = useQueryClient();

  const [dateFilter, setDateFilter] = useState("all");

  const { data: orders = [], isLoading } = useQuery({
    queryKey: ["all-orders"],
    queryFn: async () => {
      const { data } = await axiosSecure.get("/orders");
      return data;
    },
  });

  const handleStatusChange = async (orderId, status) => {
    try {
      await axiosSecure.patch(`/orders/${orderId}`, { status });
      queryClient.invalidateQueries({ queryKey: ["all-orders"] });
    } catch (error) {
      console.log(error);
    }
  };

  // ================= DELETE ORDER =================
  const handleDelete = async (orderId) => {
    const confirmDelete = window.confirm(
      "Ei order ta sompurno delete kore dite chan? Ei kaj ta abar ferano jabe na.",
    );

    if (!confirmDelete) return;

    try {
      await axiosSecure.delete(`/orders/${orderId}`);
      toast.success("Order deleted successfully");
      queryClient.invalidateQueries({ queryKey: ["all-orders"] });
    } catch (error) {
      console.log(error);
      toast.error(error?.response?.data?.message || "Failed to delete order");
    }
  };

  if (isLoading) {
    return <LoadingSpinner />;
  }

  const filteredOrders = filterOrdersByDate(orders, dateFilter);

  return (
    <div className="p-4 md:p-6">
      <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
        <h2 className="text-2xl font-bold">All Orders</h2>

        {/* ================= DATE FILTER BUTTONS ================= */}
        <div className="flex flex-wrap gap-2">
          {FILTER_OPTIONS.map((option) => (
            <button
              key={option.value}
              type="button"
              onClick={() => setDateFilter(option.value)}
              className={`px-3.5 py-1.5 rounded-full text-sm font-medium border transition ${
                dateFilter === option.value
                  ? "bg-yellow-500 text-white border-yellow-500"
                  : "bg-white text-gray-600 border-gray-300 hover:border-yellow-400 hover:text-yellow-600"
              }`}
            >
              {option.label}
            </button>
          ))}
        </div>
      </div>

      {/* No orders in selected range */}
      {filteredOrders.length === 0 && (
        <div className="bg-white rounded-md p-10 text-center border border-gray-200">
          <p className="text-gray-500">
            No orders found for the selected time range.
          </p>
        </div>
      )}

      {/* =====================================================
          DESKTOP / TABLET: TABLE VIEW
          Mobile e ei table lukiye jabe (hidden), card view dekhabe
      ===================================================== */}

      {filteredOrders.length > 0 && (
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full border-collapse text-sm">
            <thead>
              <tr className="bg-gray-100 text-left">
                <th className="p-2 md:p-3 border text-xs md:text-sm">
                  SL / Date
                </th>
                <th className="p-3 md:p-4 border">Product(s)</th>
                <th className="p-3 md:p-4 border">Qty</th>
                <th className="p-3 md:p-4 border">Customer</th>
                <th className="p-3 md:p-4 border">Phone</th>
                <th className="p-3 md:p-4 border">Address</th>
                <th className="p-3 md:p-4 border">Payment</th>
                <th className="p-3 md:p-4 border">Total</th>
                <th className="p-2 md:p-3 border text-xs md:text-sm">Status</th>
                <th className="p-2 md:p-3 border text-xs md:text-sm">Action</th>
              </tr>
            </thead>

            <tbody>
              {filteredOrders.map((order, index) => (
                <tr key={order._id}>
                  {/* ================= SL + DATE/TIME (ekta field) ================= */}
                  <td className="p-2 md:p-3 border">
                    <SerialAndDate index={index} dateValue={order.createdAt} />
                  </td>

                  {/* ================= PRODUCT(S) — naam shudhu ================= */}
                  <td className="p-3 md:p-4 border">
                    <ProductsDisplay order={order} />
                  </td>

                  {/* ================= QUANTITY — alada field ================= */}
                  <td className="p-3 md:p-4 border">
                    <QuantityDisplay order={order} />
                  </td>

                  <td className="p-3 md:p-4 border">{order.customer?.name}</td>

                  <td className="p-3 md:p-4 border">
                    <a
                      href={`tel:${order.customer?.phone}`}
                      className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-800"
                    >
                      <FiPhone size={16} />
                      {order.customer?.phone}
                    </a>
                  </td>

                  <td className="p-3 md:p-4 border">
                    {order.shipping?.address},
                    <br />
                    {order.shipping?.district}
                  </td>

                  {/* ================= PAYMENT ================= */}
                  <td className="p-3 md:p-4 border">
                    <PaymentDisplay order={order} />
                  </td>

                  <td className="p-3 md:p-4 border font-semibold">
                    ৳{order.totalCost}
                  </td>

                  <td className="p-2 md:p-3 border">
                    <StatusSelect
                      order={order}
                      onStatusChange={handleStatusChange}
                    />
                  </td>

                  {/* ================= DELETE ================= */}
                  <td className="p-2 md:p-3 border text-center">
                    <DeleteButton orderId={order._id} onDelete={handleDelete} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* =====================================================
          MOBILE: CARD VIEW
          Kono horizontal scroll lagbe na, shob info upor-niche
          shajano thakbe — puro screen width use kore.
      ===================================================== */}

      {filteredOrders.length > 0 && (
        <div className="md:hidden space-y-4">
          {filteredOrders.map((order, index) => (
            <div
              key={order._id}
              className="bg-white border border-gray-200 rounded-lg shadow-sm p-4 space-y-3"
            >
              {/* SL + DATE/TIME (ekta field) + DELETE */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold bg-gray-100 text-gray-700 px-2.5 py-1 rounded">
                    #{index + 1}
                  </span>

                  {(() => {
                    const formatted = formatDateTime(order.createdAt);
                    return formatted ? (
                      <span className="text-xs text-gray-500">
                        {formatted.datePart}, {formatted.timePart}
                      </span>
                    ) : (
                      <span className="text-xs text-gray-400">-</span>
                    );
                  })()}
                </div>

                <DeleteButton orderId={order._id} onDelete={handleDelete} />
              </div>

              <hr />

              {/* PRODUCT(S) */}
              <div>
                <p className="text-xs font-semibold text-gray-500 uppercase mb-1.5">
                  Product(s)
                </p>
                <ProductsDisplay order={order} />
              </div>

              {/* QUANTITY — alada field */}
              <div>
                <p className="text-xs font-semibold text-gray-500 uppercase mb-1.5">
                  Quantity
                </p>
                <QuantityDisplay order={order} />
              </div>

              <hr />

              {/* CUSTOMER */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <p className="text-xs font-semibold text-gray-500 uppercase mb-1">
                    Customer
                  </p>
                  <p className="text-sm">{order.customer?.name}</p>
                </div>

                <div>
                  <p className="text-xs font-semibold text-gray-500 uppercase mb-1">
                    Phone
                  </p>
                  <a
                    href={`tel:${order.customer?.phone}`}
                    className="inline-flex items-center gap-1.5 text-blue-600 hover:text-blue-800 text-sm"
                  >
                    <FiPhone size={14} />
                    {order.customer?.phone}
                  </a>
                </div>
              </div>

              {/* ADDRESS */}
              <div>
                <p className="text-xs font-semibold text-gray-500 uppercase mb-1">
                  Address
                </p>
                <p className="text-sm text-gray-700">
                  {order.shipping?.address}, {order.shipping?.district}
                </p>
              </div>

              <hr />

              {/* PAYMENT */}
              <div>
                <p className="text-xs font-semibold text-gray-500 uppercase mb-1.5">
                  Payment
                </p>
                <PaymentDisplay order={order} />
              </div>

              {/* TOTAL */}
              <div className="flex items-center justify-between pt-1">
                <p className="text-xs font-semibold text-gray-500 uppercase">
                  Total
                </p>
                <p className="font-bold text-lg text-gray-800">
                  ৳{order.totalCost}
                </p>
              </div>

              <hr />

              {/* STATUS */}
              <div className="flex items-center justify-between gap-3">
                <p className="text-xs font-semibold text-gray-500 uppercase">
                  Status
                </p>
                <StatusSelect
                  order={order}
                  onStatusChange={handleStatusChange}
                />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AllOrders;
