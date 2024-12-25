// title, description, links, tags
import { FC, useState } from "react";
// import { useDispatch } from "react-redux";
// import { createItem } from "../redux/slice"; // Update with the correct path
import { Button } from "../components/reusable/Button"; // Reusable Button component
import { Input } from "../components/reusable/Input"; // Reusable Input component

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const Modal: FC<ModalProps> = ({ isOpen, onClose }) => {
  //   const dispatch = useDispatch();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [tags, setTags] = useState<string[]>([]);
  const [links, setLinks] = useState<string[]>([]);
  const [newTag, setNewTag] = useState("");
  const [newLink, setNewLink] = useState("");

  const handleCreate = () => {
    if (title) {
      //   dispatch(createItem({ title, description, tags, links }));
      onClose();
    }
  };

  const addTag = () => {
    if (newTag && !tags.includes(newTag)) {
      setTags([...tags, newTag]);
      setNewTag("");
    }
  };

  const addLink = () => {
    if (newLink && !links.includes(newLink)) {
      setLinks([...links, newLink]);
      setNewLink("");
    }
  };

  return (
    isOpen && (
      <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
        <div className="bg-background p-6 rounded-lg w-full max-w-md">
          <h2 className="text-lg font-bold text-primary mb-4">Create Item</h2>

          <Input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Title (required)"
            className="mb-4"
          />

          <Input
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Description (optional)"
            className="mb-4"
          />

          <div className="mb-4">
            <Input
              value={newTag}
              onChange={(e) => setNewTag(e.target.value)}
              placeholder="Add a tag"
              className="mb-2"
            />
            <Button
              variant="primary"
              text="Add tag(s)"
              size="md"
              onClick={addTag}
              className="mb-2"
            />
            <div className="flex flex-wrap gap-2 mt-2">
              {tags.map((tag, index) => (
                <span
                  key={index}
                  className="px-3 py-1 text-sm font-medium text-white bg-secondary rounded-full"
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>

          <div className="mb-4">
            <Input
              value={newLink}
              onChange={(e) => setNewLink(e.target.value)}
              placeholder="Add a link"
              className="mb-2"
            />
            <Button
              variant="primary"
              text="Add link(s)"
              size="md"
              onClick={addLink}
              className="mb-2"
            />

            <ul className="mt-2 space-y-1">
              {links.map((link, index) => (
                <li key={index} className="text-accent underline">
                  {link}
                </li>
              ))}
            </ul>
          </div>

          <div className="flex justify-end gap-2">
            <Button
              variant="cancel"
              text="Cancel"
              size="md"
              onClick={onClose}
            />
            <Button
              variant="submit"
              size="md"
              text="Create"
              onClick={handleCreate}
              disabled={!title}
            />
          </div>
        </div>
      </div>
    )
  );
};

export default Modal;
