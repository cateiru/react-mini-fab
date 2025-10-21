import type { Meta, StoryObj } from "@storybook/react";
import { useEffect, useState } from "react";
import Accessibility from "../public/accessibility.svg";
import Construct from "../public/construct.svg";
import { MiniFAB } from "./MiniFAB";

const meta = {
  title: "MiniFAB",
  component: MiniFAB,
  parameters: {
    layout: "centered",
  },
} satisfies Meta<typeof MiniFAB>;

export default meta;
type Story = StoryObj<typeof meta>;

export const IconLeft: Story = {
  name: "Icon Left",
  args: {
    ariaLabel: "MiniFAB",
    title: "Floating Action Button",
    backgroundColor: "red",
    position: "left",
    isHide: true,
    draggableId: "fab-1",
  },
  render: (args) => {
    const [hided, setHidden] = useState(false);
    const [clicked, setClicked] = useState(false);

    useEffect(() => {
      if (clicked) {
        const timer = setTimeout(() => {
          setClicked(false);
        }, 1000);
        return () => clearTimeout(timer);
      }
    }, [clicked]);

    return (
      <>
        <p>Clicked: {clicked ? "Yes" : "No"}</p>
        <button type="button" onClick={() => setHidden(!hided)}>
          Toggle FAB
        </button>
        <MiniFAB {...args} isHide={hided} onClick={() => setClicked(true)}>
          <img
            src={Accessibility}
            alt="accessibility icon"
            width="20px"
            height="20px"
          />
        </MiniFAB>
      </>
    );
  },
};

export const IconRight: Story = {
  name: "Icon Right",
  args: {
    ariaLabel: "MiniFAB",
    title: "Floating Action Button",
    backgroundColor: "blue",
    position: "right",
    draggableId: "fab-2",
  },
  render: (args) => {
    const [hided, setHidden] = useState(false);

    return (
      <>
        <button type="button" onClick={() => setHidden(!hided)}>
          Toggle FAB
        </button>
        <MiniFAB {...args} isHide={hided}>
          <img
            src={Accessibility}
            alt="accessibility icon"
            width="20px"
            height="20px"
          />
        </MiniFAB>
      </>
    );
  },
};

export const SwitchablePosition: Story = {
  name: "Switchable Position",
  args: {
    ariaLabel: "MiniFAB",
    title: "Floating Action Button",
    backgroundColor: "purple",
    draggableId: "fab-3",
  },
  render: (args) => {
    const [position, setPosition] = useState<"left" | "right">("right");

    return (
      <>
        <button
          type="button"
          onClick={() => setPosition(position === "right" ? "left" : "right")}
        >
          Toggle FAB Position
        </button>
        <MiniFAB {...args} position={position}>
          <img
            src={Construct}
            alt="accessibility icon"
            width="20px"
            height="20px"
          />
        </MiniFAB>
      </>
    );
  },
};

export const TextLeft: Story = {
  name: "Text",
  args: {
    ariaLabel: "MiniFAB",
    title: "Floating Action Button",
    backgroundColor: "green",
    draggableId: "fab-4",
    children: <p style={{ color: "#fff" }}>Text Hello World</p>,
  },
};

export const Badge: Story = {
  name: "Badge",
  args: {
    ariaLabel: "MiniFAB",
    title: "Floating Action Button",
    backgroundColor: "orange",
    position: "left",
    draggableId: "fab-5",
    badge: { color: "red" },
    children: (
      <img
        src={Construct}
        alt="accessibility icon"
        width="20px"
        height="20px"
      />
    ),
  },
};

export const BadgeWithText: Story = {
  name: "Badge With Text",
  args: {
    ariaLabel: "MiniFAB",
    title: "Floating Action Button",
    backgroundColor: "#b02883",
    position: "left",
    draggableId: "fab-5",
    badge: { color: "#4a26ff" },
    children: <p style={{ color: "#fff" }}>Text Hello World</p>,
  },
};
