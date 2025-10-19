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

export const Left: Story = {
  args: {
    ariaLabel: "FloatingActionButton",
    title: "Floating Action Button",
    backgroundColor: "red",
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

export const Right: Story = {
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
