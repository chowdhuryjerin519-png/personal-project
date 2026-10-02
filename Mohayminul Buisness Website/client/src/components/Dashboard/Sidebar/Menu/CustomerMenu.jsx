import { BsFingerprint } from "react-icons/bs";
import MenuItem from "./MenuItem";
const CustomerMenu = () => {
  return (
    <>
      <MenuItem icon={BsFingerprint} label="My Orders" address="my-orders" />
    </>
  );
};

export default CustomerMenu;
