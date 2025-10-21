import type { Meta, StoryObj } from "@storybook/react";
import { useState } from "react";
import Accessibility from "../public/accessibility.svg";
import { FloatingActionButton } from "./FloatingActionButton";

const meta = {
  title: "FloatingActionButton",
  component: FloatingActionButton,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
} satisfies Meta<typeof FloatingActionButton>;

export default meta;
type Story = StoryObj<typeof meta>;

export const IconLeft: Story = {
  name: "Icon Left",
  args: {
    ariaLabel: "FloatingActionButton",
    title: "Floating Action Button",
    backgroundColor: "red",
    position: "left",
    isHide: true,
  },
  render: (args) => {
    const [hided, setHidden] = useState(false);

    return (
      <>
        <button type="button" onClick={() => setHidden(!hided)}>
          Toggle FAB
        </button>
        <FloatingActionButton {...args} isHide={hided}>
          <img
            src={Accessibility}
            alt="accessibility icon"
            width="20px"
            height="20px"
          />
        </FloatingActionButton>
      </>
    );
  },
};

export const IconRight: Story = {
  name: "Icon Right",
  args: {
    ariaLabel: "FloatingActionButton",
    title: "Floating Action Button",
    backgroundColor: "blue",
    position: "right",
  },
  render: (args) => {
    const [hided, setHidden] = useState(false);

    return (
      <>
        <button type="button" onClick={() => setHidden(!hided)}>
          Toggle FAB
        </button>
        <FloatingActionButton {...args} isHide={hided}>
          <img
            src={Accessibility}
            alt="accessibility icon"
            width="20px"
            height="20px"
          />
        </FloatingActionButton>
      </>
    );
  },
};

export const SwitchablePosition: Story = {
  name: "Switchable Position",
  args: {
    ariaLabel: "FloatingActionButton",
    title: "Floating Action Button",
    backgroundColor: "blue",
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
        <FloatingActionButton {...args} position={position}>
          <img
            src={Accessibility}
            alt="accessibility icon"
            width="20px"
            height="20px"
          />
        </FloatingActionButton>
      </>
    );
  },
};

export const TextLeft: Story = {
  name: "Text",
  args: {
    ariaLabel: "FloatingActionButton",
    title: "Floating Action Button",
    backgroundColor: "green",
    children: <p style={{ color: "#fff" }}>Text Hello World</p>,
  },
};
