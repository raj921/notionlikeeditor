import { createReactBlockSpec } from "@blocknote/react";
import { Menu } from "@mantine/core";
import { GrMultimedia } from "react-icons/gr";

// Function to get YouTube video ID from URL
const getYouTubeId = (url: string) => {
  const regExp =
    /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
  const match = url.match(regExp);

  return match && match[2].length === 11 ? match[2] : null;
};

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
        values: ["image", "video", "youtube"],
      },
    },
    content: "none",
  },
  {
    render: (props) => {
      const { url, type } = props.block.props;
      const videoId = type === "youtube" ? getYouTubeId(url) : null;

      return (
        <div className="media-block">
          {type === "image" && <img src={url} alt="" />}
          {type === "video" && <video src={url} controls />}
          {type === "youtube" && videoId && (
            <iframe
              src={`https://www.youtube.com/embed/${videoId}`}
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
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
      const isYouTube =
        url.includes("youtube.com") || url.includes("youtu.be");
      const type = isYouTube
        ? "youtube"
        : url.match(/\.(jpeg|jpg|gif|png)$/)
        ? "image"
        : "video";
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
  aliases: ["media", "image", "video", "youtube"],
  group: "Media",
  icon: <GrMultimedia />,
});
