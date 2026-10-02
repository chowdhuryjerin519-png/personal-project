import { Helmet } from "react-helmet-async";
import PropTypes from "prop-types";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import useAuth from "../../../hooks/useAuth";
import useAxiosSecure from "../../../hooks/useAxiosSecure";
import LoadingSpinner from "../../../components/Shared/LoadingSpinner";

const MyOrders = () => {
  const { user } = useAuth();
  const axiosSecure = useAxiosSecure();
  const queryClient = useQueryClient();

  const { data: orders = [], isLoading } = useQuery({
    queryKey: ["my-orders", user?.email],

    queryFn: async () => {
      const { data } = await axiosSecure.get(`/my-orders/${user?.email}`);

      return data;
    },

    enabled: !!user?.email,
  });

  // Cancel order
  const handleCancelOrder = async (id) => {
    const confirmCancel = window.confirm(
      "Are you sure you want to cancel this order?",
    );

    if (!confirmCancel) return;

    try {
      await axiosSecure.patch(`/orders/${id}/cancel`);

      queryClient.invalidateQueries({
        queryKey: ["my-orders", user?.email],
      });

      alert("Order cancelled successfully");
    } catch (error) {
      console.log(error);

      alert(error.response?.data?.message || "Failed to cancel order");
    }
  };

  if (isLoading) {
    return <LoadingSpinner />;
  }

  return (
    <>
      <Helmet>
        <title>My Orders</title>
      </Helmet>

      <div className="container mx-auto px-4 sm:px-8">
        <div className="py-8">
          {/* HEADER */}

          <div className="mb-6">
            <h1 className="text-2xl md:text-3xl font-bold text-gray-800">
              My Orders
            </h1>

            <p className="text-gray-500 mt-1">Track and manage your orders.</p>
          </div>

          {orders.length === 0 ? (
            <div className="text-center py-16 bg-white rounded-lg shadow">
              <p className="text-gray-500">No orders found</p>
            </div>
          ) : (
            <div className="space-y-5">
              {orders.map((order) => {
                // এক order এ একাধিক product থাকতে পারে (cart checkout)
                const products = Array.isArray(order.products)
                  ? order.products
                  : [];

                const canCancel = ["pending", "processing"].includes(
                  order.status,
                );

                return (
                  <div
                    key={order._id}
                    className="bg-white rounded-xl shadow-sm overflow-hidden"
                  >
                    {/* ================= ORDER HEADER ================= */}

                    <div className="flex flex-wrap items-center justify-between gap-2 px-4 md:px-5 py-3 bg-gray-50 border-b">
                      <div className="text-xs md:text-sm text-gray-500">
                        <span className="font-medium text-gray-700">
                          Order ID:
                        </span>{" "}
                        {order._id}
                        {order.createdAt && (
                          <span className="ml-3">
                            {new Date(order.createdAt).toLocaleDateString(
                              "en-GB",
                              {
                                day: "2-digit",
                                month: "short",
                                year: "numeric",
                              },
                            )}
                          </span>
                        )}
                      </div>

                      <StatusBadge status={order.status} />
                    </div>

                    {/* ================= PRODUCT LIST ================= */}

                    <div className="divide-y">
                      {products.length > 0 ? (
                        products.map((item, index) => (
                          <div
                            key={`${order._id}-${index}`}
                            className="flex items-center gap-3 px-4 md:px-5 py-4"
                          >
                            {/* IMAGE */}

                            <img
                              src={item.image}
                              alt={item.name || "Product"}
                              className="w-16 h-16 object-cover rounded-lg border flex-shrink-0"
                            />

                            {/* INFO */}

                            <div className="flex-1 min-w-0">
                              <p className="font-medium text-gray-800 truncate">
                                {item.name || "Product"}
                              </p>

                              {item.category && (
                                <p className="text-xs text-gray-400">
                                  {item.category}
                                </p>
                              )}

                              <p className="text-sm text-gray-500 mt-1">
                                Qty: {item.quantity || 1}
                              </p>
                            </div>

                            {/* PRICE */}

                            <div className="text-right flex-shrink-0">
                              <p className="font-semibold text-yellow-600">
                                ৳{Number(item.price || 0).toLocaleString()}
                              </p>
                            </div>
                          </div>
                        ))
                      ) : (
                        <p className="px-4 md:px-5 py-4 text-sm text-gray-400">
                          Product details not available
                        </p>
                      )}
                    </div>

                    {/* ================= FOOTER: TOTAL + ACTION ================= */}

                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 px-4 md:px-5 py-4 border-t bg-gray-50">
                      <div className="text-sm text-gray-600">
                        Total:{" "}
                        <span className="font-bold text-gray-800 text-base">
                          ৳{Number(order.totalCost || 0).toLocaleString()}
                        </span>
                      </div>

                      {canCancel ? (
                        <button
                          onClick={() => handleCancelOrder(order._id)}
                          className="px-5 py-2 rounded-lg bg-red-500 text-white hover:bg-red-600 transition text-sm font-semibold"
                        >
                          Cancel Order
                        </button>
                      ) : (
                        <span className="text-gray-400 text-sm">
                          Not Available
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </>
  );
};

const StatusBadge = ({ status }) => {
  const statusText = {
    pending: "Pending",
    processing: "Start Processing",
    shipped: "Delivery Courier",
    delivered: "Delivery Complete",
    cancelled: "Cancelled",
  };

  const text = statusText[status] || "Pending";

  const statusClass = {
    pending: "bg-yellow-100 text-yellow-700",
    processing: "bg-blue-100 text-blue-700",
    shipped: "bg-purple-100 text-purple-700",
    delivered: "bg-green-100 text-green-700",
    cancelled: "bg-red-100 text-red-700",
  };

  return (
    <span
      className={`px-3 py-1 rounded-full text-xs md:text-sm font-medium ${
        statusClass[status] || "bg-yellow-100 text-yellow-700"
      }`}
    >
      {text}
    </span>
  );
};

StatusBadge.propTypes = {
  status: PropTypes.string,
};

export default MyOrders;
