import {
  Menu,
  Group,
  Center,
  Burger,
  Container,
  Drawer,
  Button,
  Badge,
} from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import {
  IconChevronDown,
  IconUserCircle,
  IconShoppingCart,
} from "@tabler/icons-react";
import { MantineLogo } from "@mantinex/mantine-logo";
import classes from "./HeaderMenu.module.css";
import logo512 from "../assets/images/logo512.png";
import { Link } from "@remix-run/react";
import { NavbarSimple } from "./NavbarSimple";
import { NavbarCart } from "./NavbarCart";
import { useCartState } from "../providers/useCart";

const links = [
  { link: "/ourproducts", label: "Our Products" },
  { link: "/contact", label: "Contact" },
  { link: "CART", label: <IconShoppingCart />, toggleCart: true },
  {
    link: "",
    label: <IconUserCircle />,
    links: [
      { link: "/login", label: "Login" },
      { link: "/orders", label: "My orders" },
      { link: "/login", label: "Switch Account" },
    ],
  },
];

export function HeaderMenu({ user }) {
  const [burgerMenuOpened, { toggle: toggleBurgerMenu }] = useDisclosure(false);
  const [cartOpened, { toggle: toggleCart }] = useDisclosure(false);
  const totalItems = useCartState((state) => state.totalItems);

  const items = links.map((link, itemidx) => {
    const menuItems = link.links?.map((item, menuitemidx) => {
      if (user && item.label == "Login") return null;
      if (
        !user &&
        (item.label == "My orders" || item.label == "Switch Account")
      )
        return null;
      return (
        <Link
          key={"menuitemlink_" + item.label + menuitemidx}
          to={item.link}
          className={classes.subLink}
        >
          <Menu.Item key={"menuitem_" + item.label + menuitemidx}>
            {item.label}
          </Menu.Item>
        </Link>
      );
    });

    if (menuItems) {
      return (
        <Menu
          key={"menu_" + link + itemidx}
          trigger="hover"
          transitionProps={{ exitDuration: 0 }}
          withinPortal
        >
          <Menu.Target>
            <Link
              className={classes.link}
              onClick={(event) => event.preventDefault()}
            >
              <Center>
                <span className={classes.linkLabel}>{link.label}</span>
                <IconChevronDown size="0.9rem" stroke={1.5} />
              </Center>
            </Link>
          </Menu.Target>
          <Menu.Dropdown>{menuItems}</Menu.Dropdown>
        </Menu>
      );
    } else {
      if (link.link == "CART") {
        return (
          <span
            className={classes.link}
            onClick={toggleCart}
            style={{ paddingRight: "0px", cursor: "pointer" }}
          >
            <IconShoppingCart
              cursor="pointer"
              color="white"
              style={{ marginTop: "5px" }}
            />
            <Badge
              size="md"
              circle
              style={{ position: "relative", bottom: "20px", right: "5px" }}
            >
              {totalItems}
            </Badge>
          </span>
        );
      } else
        return (
          <Link
            key={"menu" + link + itemidx}
            to={link?.toggleCart ? null : link.link}
            onClick={
              link?.toggleCart
                ? (event) => {
                    toggleCart();
                    event.preventDefault();
                  }
                : ""
            }
            className={classes.link}
          >
            {link.label}
          </Link>
        );
    }
  });

  return (
    <>
      <header className={classes.header}>
        <Container size="90%">
          <div className={classes.inner}>
            <Link to="/">
              <img src={logo512} className={classes.steeleMarketLogo} />
            </Link>

            <Group gap={5} visibleFrom="sm">
              {items}
            </Group>
            <Group hiddenFrom="sm">
              <Burger
                opened={burgerMenuOpened}
                onClick={toggleBurgerMenu}
                size="sm"
                hiddenFrom="sm"
              />
              <span style={{ cursor: "pointer" }} onClick={toggleCart}>
                <IconShoppingCart cursor="pointer" color="white" />
                <Badge
                  size="md"
                  circle
                  style={{ position: "relative", bottom: "20px", right: "5px" }}
                >
                  {totalItems}
                </Badge>
              </span>
            </Group>
          </div>
        </Container>
      </header>
      <Drawer
        opened={burgerMenuOpened}
        onClose={toggleBurgerMenu}
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
        <NavbarSimple toggle={toggleBurgerMenu} user={user} />
      </Drawer>

      <Drawer
        opened={cartOpened}
        onClose={toggleCart}
        position="right"
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
    </>
  );
}
