import { createReactBlockSpec } from "@blocknote/react";
import { Menu } from "@mantine/core";
import { GrMultimedia } from "react-icons/gr";

// The "media" block.
export const MediaBlock = createReactBlockSpec(
  {
    type: "media",
    propSchema: {
      url: {
        default: "",
      },
      type: {
        default: "image",
        values: ["image", "video"],
      },
    },
    content: "none",
  },
  {
    render: (props) => {
      const { url, type } = props.block.props;

      return (
        <div className="media-block">
          {type === "image" ? (
            <img src={url} alt="" />
          ) : (
            <video src={url} controls />
          )}
        </div>
      );
    },
  }
);

// Slash menu item to insert a "media" block
export const insertMedia = (editor) => ({
  title: "Media",
  onItemClick: () => {
    const url = prompt("Enter media URL");
    if (url) {
      const type = url.match(/\.(jpeg|jpg|gif|png)$/) ? "image" : "video";
      editor.insertBlocks(
        [
          {
            type: "media",
            props: {
              url,
              type,
            },
          },
        ],
        editor.getTextCursorPosition().block,
        "after"
      );
    }
  },
  aliases: ["media", "image", "video"],
  group: "Media",
  icon: <GrMultimedia />,
});
