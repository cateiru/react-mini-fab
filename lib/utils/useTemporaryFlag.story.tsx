import type { Meta, StoryObj } from "@storybook/react";
import { useId, useState } from "react";
import { useTemporaryFlag } from "./useTemporaryFlag";

const meta = {
  title: "Hooks/useTemporaryFlag",
  parameters: {
    layout: "centered",
  },
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

const TemporaryFlagDemo = () => {
  const [isHidden, setHidden] = useTemporaryFlag("demo-flag");
  const [expireMinutes, setExpireMinutes] = useState(1);
  const inputId = useId();

  const hideTemporarily = () => {
    const expireTime = new Date();
    expireTime.setMinutes(expireTime.getMinutes() + expireMinutes);
    setHidden(expireTime);
  };

  return (
    <div style={{ padding: "20px", maxWidth: "400px" }}>
      <h2>useTemporaryFlag Demo</h2>

      <div style={{ marginBottom: "20px" }}>
        <p>
          <strong>Flag Status:</strong>{" "}
          <span
            style={{
              color: isHidden ? "red" : "green",
              fontWeight: "bold",
            }}
          >
            {isHidden ? "Hidden (Active)" : "Visible (Inactive)"}
          </span>
        </p>
      </div>

      <div style={{ marginBottom: "20px" }}>
        <label htmlFor={inputId}>
          Expire after (minutes):
          <input
            id={inputId}
            type="number"
            min="1"
            max="60"
            value={expireMinutes}
            onChange={(e) => setExpireMinutes(Number(e.target.value))}
            style={{ marginLeft: "10px", width: "60px" }}
          />
        </label>
      </div>

      <div>
        <button
          type="button"
          onClick={hideTemporarily}
          disabled={isHidden}
          style={{
            padding: "10px 20px",
            fontSize: "16px",
            cursor: isHidden ? "not-allowed" : "pointer",
            opacity: isHidden ? 0.5 : 1,
          }}
        >
          Set Flag for {expireMinutes} minute{expireMinutes > 1 ? "s" : ""}
        </button>
      </div>

      <div style={{ marginTop: "20px", fontSize: "14px", color: "#666" }}>
        <p>
          <strong>Note:</strong> The flag is stored in a cookie and will
          automatically expire after the specified time.
        </p>
        <p>
          The hook checks the cookie every second, so the status will update
          automatically when it expires.
        </p>
      </div>

      {isHidden && (
        <div
          style={{
            marginTop: "20px",
            padding: "15px",
            backgroundColor: "#fff3cd",
            border: "1px solid #ffc107",
            borderRadius: "4px",
          }}
        >
          <strong>💡 Simulated Content:</strong>
          <p style={{ margin: "5px 0 0 0" }}>
            This content is hidden when the flag is active. In a real
            application, you might use this to temporarily hide a MiniFAB or
            other UI elements.
          </p>
        </div>
      )}
    </div>
  );
};

export const Default: Story = {
  render: () => <TemporaryFlagDemo />,
};

const MiniFABWithTemporaryHide = () => {
  const [isHidden, setHidden] = useTemporaryFlag("minifab-hidden");

  const hide24Hours = () => {
    const expireTime = new Date();
    expireTime.setHours(expireTime.getHours() + 24);
    setHidden(expireTime);
  };

  const hide1Minute = () => {
    const expireTime = new Date();
    expireTime.setMinutes(expireTime.getMinutes() + 1);
    setHidden(expireTime);
  };

  return (
    <div style={{ padding: "20px", maxWidth: "500px" }}>
      <h2>MiniFAB Temporary Hide Example</h2>

      <div style={{ marginBottom: "20px" }}>
        <p>
          <strong>MiniFAB Status:</strong>{" "}
          <span
            style={{
              color: isHidden ? "red" : "green",
              fontWeight: "bold",
            }}
          >
            {isHidden ? "Hidden" : "Visible"}
          </span>
        </p>
      </div>

      <div style={{ display: "flex", gap: "10px", marginBottom: "20px" }}>
        <button
          type="button"
          onClick={hide1Minute}
          disabled={isHidden}
          style={{
            padding: "10px 15px",
            cursor: isHidden ? "not-allowed" : "pointer",
            opacity: isHidden ? 0.5 : 1,
          }}
        >
          Hide for 1 minute
        </button>
        <button
          type="button"
          onClick={hide24Hours}
          disabled={isHidden}
          style={{
            padding: "10px 15px",
            cursor: isHidden ? "not-allowed" : "pointer",
            opacity: isHidden ? 0.5 : 1,
          }}
        >
          Hide for 24 hours
        </button>
      </div>

      {!isHidden ? (
        <div
          style={{
            width: "60px",
            height: "60px",
            borderRadius: "50%",
            backgroundColor: "#2196f3",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "white",
            fontSize: "24px",
            boxShadow: "0 2px 8px rgba(0,0,0,0.2)",
          }}
        >
          FAB
        </div>
      ) : (
        <div
          style={{
            padding: "15px",
            backgroundColor: "#ffebee",
            border: "1px solid #f44336",
            borderRadius: "4px",
          }}
        >
          <p style={{ margin: 0 }}>
            The MiniFAB is temporarily hidden. It will automatically reappear
            when the cookie expires.
          </p>
        </div>
      )}
    </div>
  );
};

export const MiniFABExample: Story = {
  name: "MiniFAB Hide Example",
  render: () => <MiniFABWithTemporaryHide />,
};

const MultipleFlags = () => {
  const [flag1, setFlag1] = useTemporaryFlag("flag-1");
  const [flag2, setFlag2] = useTemporaryFlag("flag-2");
  const [flag3, setFlag3] = useTemporaryFlag("flag-3");

  const setFlagFor = (setFlag: (expireTime: Date) => void, minutes: number) => {
    const expireTime = new Date();
    expireTime.setMinutes(expireTime.getMinutes() + minutes);
    setFlag(expireTime);
  };

  return (
    <div style={{ padding: "20px", maxWidth: "600px" }}>
      <h2>Multiple Independent Flags</h2>
      <p style={{ color: "#666", fontSize: "14px" }}>
        Each flag is managed independently with its own cookie.
      </p>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(3, 1fr)",
          gap: "15px",
          marginTop: "20px",
        }}
      >
        <div
          style={{
            padding: "15px",
            border: "2px solid #2196f3",
            borderRadius: "8px",
          }}
        >
          <h3 style={{ margin: "0 0 10px 0" }}>Flag 1</h3>
          <p>
            Status:{" "}
            <strong style={{ color: flag1 ? "red" : "green" }}>
              {flag1 ? "Active" : "Inactive"}
            </strong>
          </p>
          <button
            type="button"
            onClick={() => setFlagFor(setFlag1, 1)}
            disabled={flag1}
            style={{
              padding: "8px 12px",
              width: "100%",
              cursor: flag1 ? "not-allowed" : "pointer",
              opacity: flag1 ? 0.5 : 1,
            }}
          >
            Set for 1 min
          </button>
        </div>

        <div
          style={{
            padding: "15px",
            border: "2px solid #4caf50",
            borderRadius: "8px",
          }}
        >
          <h3 style={{ margin: "0 0 10px 0" }}>Flag 2</h3>
          <p>
            Status:{" "}
            <strong style={{ color: flag2 ? "red" : "green" }}>
              {flag2 ? "Active" : "Inactive"}
            </strong>
          </p>
          <button
            type="button"
            onClick={() => setFlagFor(setFlag2, 2)}
            disabled={flag2}
            style={{
              padding: "8px 12px",
              width: "100%",
              cursor: flag2 ? "not-allowed" : "pointer",
              opacity: flag2 ? 0.5 : 1,
            }}
          >
            Set for 2 min
          </button>
        </div>

        <div
          style={{
            padding: "15px",
            border: "2px solid #ff9800",
            borderRadius: "8px",
          }}
        >
          <h3 style={{ margin: "0 0 10px 0" }}>Flag 3</h3>
          <p>
            Status:{" "}
            <strong style={{ color: flag3 ? "red" : "green" }}>
              {flag3 ? "Active" : "Inactive"}
            </strong>
          </p>
          <button
            type="button"
            onClick={() => setFlagFor(setFlag3, 3)}
            disabled={flag3}
            style={{
              padding: "8px 12px",
              width: "100%",
              cursor: flag3 ? "not-allowed" : "pointer",
              opacity: flag3 ? 0.5 : 1,
            }}
          >
            Set for 3 min
          </button>
        </div>
      </div>
    </div>
  );
};

export const MultipleIndependentFlags: Story = {
  name: "Multiple Independent Flags",
  render: () => <MultipleFlags />,
};
