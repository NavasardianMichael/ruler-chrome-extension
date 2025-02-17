import styles from "./header.module.css";

export const Header = () => {
  return (
    <>
      <header className={styles.header}>
        <h1 className={styles.title}>Ruler</h1>
      </header>
      <hr />
    </>
  );
};
