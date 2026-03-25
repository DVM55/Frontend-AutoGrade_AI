import React, { useState } from "react";
import Media from "./Media";

const Test = () => {
  const [open, setOpen] = useState(false);

  return (
    <div className="p-3">
      <button className="btn btn-primary" onClick={() => setOpen(true)}>
        Open Media
      </button>

      <Media
        show={open}
        onClose={() => setOpen(false)}
        onSelect={(file) => console.log(file)}
      />
    </div>
  );
};

export default Test;
