import type { StorybookConfig } from "@storybook/react-vite";

const config: StorybookConfig = {
  stories: ["../lib/**/*.story.tsx"],
  addons: ["@storybook/addon-essentials", "@storybook/addon-links"],
  framework: {
    name: "@storybook/react-vite",
    options: {},
  },
  core: {
    builder: "@storybook/builder-vite",
  },
};

export default config;
