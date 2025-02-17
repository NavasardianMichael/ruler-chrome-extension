import { Header } from "./header/Header";
import { Settings } from "./settings/Settings";
import styles from "./container.module.css";

export const Container = () => {
  return (
    <div className={styles.container}>
      <Header />
      <Settings />
    </div>
  );
};
