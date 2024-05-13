import { useState } from "react";
import { Group, Code, Drawer } from "@mantine/core";
import {
  IconBellRinging,
  IconFingerprint,
  IconKey,
  IconSettings,
  Icon2fa,
  IconDatabaseImport,
  IconReceipt2,
  IconSwitchHorizontal,
  IconLogout,
  IconShoppingCart,
  IconDeviceImac,
  IconPhoneCheck,
  IconFileInvoice,
} from "@tabler/icons-react";
import { MantineLogo } from "@mantinex/mantine-logo";
import classes from "./NavbarSimple.module.css";
import steeleMarketLogo from "../assets/images/logo512.png";
import { Link } from "@remix-run/react";
import { useDisclosure } from "@mantine/hooks";
import { NavbarCart } from "./NavbarCart";

const data = [
  { link: "/ourproducts", label: "Our Products", icon: IconDeviceImac },
  { link: "/contact", label: "Contact Us", icon: IconPhoneCheck },
  { link: "/login", label: "Login", icon: IconKey },
  { link: "/orders", label: "Your orders", icon: IconFileInvoice },
  { link: "/login", label: "Switch Account", icon: IconKey },
  // { link: "", label: "Databases", icon: IconDatabaseImport },
  // { link: "", label: "Authentication", icon: Icon2fa },
  // { link: "", label: "Other Settings", icon: IconSettings },
  // { link: "", label: "Logout", icon: IconLogout },
];

export function NavbarSimple({ toggle, user }) {
  const [active, setActive] = useState("");
  const [cartOpened, { toggle: toggleCart }] = useDisclosure(false);
  // console.log("user", user);

  const links = data.map((item) => {
    if (item.label == "Login" && user) return null
    if (item.label == "Your orders" && !user) return null
    if (item.label == "Switch Account" && !user) return null

    return (
      <Link
        className={classes.link}
        data-active={item.label === active || undefined}
        to={item.link}
        key={item.label}
        onClick={(event) => {
          setActive(item.label);
          toggle();
        }}
      >
        <item.icon className={classes.linkIcon} stroke={1.5} />
        <span>{item.label}</span>
      </Link>
    );
  });

  return (
    <nav className={classes.navbar}>
      <div className={classes.navbarMain}>
        <Group className={classes.header} justify="space-between">
          <Link to="/" onClick={toggle}>
          <img src={steeleMarketLogo} className={classes.steeleMarketLogo} />
          </Link>
        </Group>
        {links}
        <Link
          className={classes.link}
          data-active={"cart" === active || undefined}
          key={"navbaraddtocart"}
          onClick={(event) => {
            setActive("cart");
            toggleCart();
            event.preventDefault();
          }}
        >
          <IconShoppingCart className={classes.linkIcon} stroke={1.5} />
          <span>Cart</span>
        </Link>
        <Drawer
          opened={cartOpened}
          onClose={toggleCart}
          transitionProps={{
            enter: {
              transform: "translateX(0)",
              transition: "transform 0.3s ease", // Adjust duration and timing function as needed
            },
            exit: {
              transform: "translateX(-100%)",
              transition: "transform 0.3s ease", // Adjust duration and timing function as needed
            },
          }}
        >
          <NavbarCart toggle={toggleCart} />
        </Drawer>
      </div>
    </nav>
  );
}
