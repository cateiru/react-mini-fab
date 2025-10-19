import type { Meta, StoryObj } from "@storybook/react";
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

export const Default: Story = {
  args: {
    ariaLabel: "FloatingActionButton",
  },
};

export const WithIcon: Story = {
  args: {
    ariaLabel: "Add",
    icon: <span>+</span>,
  },
};

export const CustomColors: Story = {
  args: {
    ariaLabel: "Custom",
    icon: <span>★</span>,
    color: "#ffffff",
    backgroundColor: "#ff5722",
  },
};

export const Large: Story = {
  args: {
    ariaLabel: "Large",
    icon: <span>+</span>,
    size: "large",
  },
};

export const Small: Story = {
  args: {
    ariaLabel: "Small",
    icon: <span>+</span>,
    size: "small",
  },
};
