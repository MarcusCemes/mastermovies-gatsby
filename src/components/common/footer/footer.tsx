import { Tooltip } from "antd";
import classnames from "classnames";
import { Link } from "gatsby";
import React, { useContext } from "react";
import { FOOTER_LINKS, SOCIAL_LINKS } from "../../../config";
import { ThemeContext } from "../../../hooks/theme";
import { SmartLink } from "../smart_link";
import styles from "./footer.module.css";

export const Footer: React.FC = () => {
  const theme = useContext(ThemeContext);

  return (
    <footer className={classnames(styles.root, { [styles.dark]: theme === "dark" })}>
      <div className={styles.title}>MasterMovies</div>
      <div className={styles.subtitle}>A small media company</div>

      <div className={styles.links}>
        {FOOTER_LINKS.map((link) => (
          <SmartLink key={link.text} className={styles.link} link={link.link}>
            {link.text}
          </SmartLink>
        ))}
      </div>

      <div className={styles.links}>
        {SOCIAL_LINKS.map((link) => (
          <a key={link.text} href={link.link}>
            <Tooltip title={link.text} placement="bottom">
              <link.icon className={classnames(styles.icon, styles.link)} />
            </Tooltip>
          </a>
        ))}
      </div>

      <p className={styles.breadcrumb}>
        <span className={styles.breadcrumbMessage}>
          All rights reserved © {Math.min(2020, new Date().getFullYear())} Marcus Cemes – Powered by{" "}
          <Link to="/status" style={{ color: "inherit" }}>
            <b>SnowOwl</b>
          </Link>
        </span>
      </p>
    </footer>
  );
};
