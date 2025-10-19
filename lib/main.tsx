import styles from "./HelloWorld.module.css";

export function HelloWorld() {
  return (
    <div className={styles.container}>
      <h1 className={styles.title}>Hello, World!</h1>
      <p className={styles.description}>React Help Window へようこそ</p>
    </div>
  );
}
