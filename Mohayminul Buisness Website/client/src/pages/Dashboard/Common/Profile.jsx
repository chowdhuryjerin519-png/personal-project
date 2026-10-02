import useAuth from "../../../hooks/useAuth";
import { Helmet } from "react-helmet-async";
import coverImg from "../../../assets/images/cover.jpg";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";

const Profile = () => {
  const { user } = useAuth();

  const { data: dbUser = {}, isLoading } = useQuery({
    queryKey: ["user-profile", user?.email],
    enabled: !!user?.email,
    queryFn: async () => {
      const { data } = await axios.get(
        `${import.meta.env.VITE_API_URL}/users/${user.email}`,
      );

      return data;
    },
  });

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <>
      <Helmet>
        <title>Profile | Web Developer BD</title>
      </Helmet>

      <div className="max-w-4xl mx-auto py-10 px-4">
        <div className="bg-white rounded-xl shadow-md overflow-hidden">
          {/* Cover */}
          <div>
            <img
              src={coverImg}
              alt="Cover"
              className="w-full h-52 object-cover"
            />
          </div>

          {/* Profile Image */}
          <div className="flex justify-center -mt-16">
            <img
              src={user?.photoURL || "https://i.ibb.co/2kR3x0Y/user.png"}
              alt={user?.displayName || "User"}
              className="w-32 h-32 rounded-full border-4 border-white object-cover"
            />
          </div>

          {/* Profile Information */}
          <div className="p-6 text-center">
            {/* Dynamic Role */}
            <p className="p-2 px-4 text-xs text-white bg-lime-500 rounded-full uppercase">
              {dbUser.role || "customer"}
            </p>

            <p className="mt-3 text-xl font-medium text-gray-800">
              User ID: {user?.uid}
            </p>

            <div className="w-full p-4 mt-6 rounded-lg">
              <div className="flex flex-wrap items-center justify-between gap-6 text-sm text-gray-600">
                <p className="flex flex-col">
                  Name
                  <span className="font-bold text-black">
                    {user?.displayName || "Not Available"}
                  </span>
                </p>

                <p className="flex flex-col">
                  Email
                  <span className="font-bold text-black">{user?.email}</span>
                </p>

                <div className="">
                  <button className="bg-lime-500 px-10 py-2 mr-4 rounded-lg text-black cursor-pointer hover:bg-lime-800 mb-2">
                    Update Profile
                  </button>

                  <button className="bg-lime-500 px-7 py-2 rounded-lg text-black cursor-pointer hover:bg-lime-800">
                    Change Password
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Profile;
