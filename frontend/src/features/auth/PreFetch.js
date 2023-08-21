import { store } from "../../app/store";
import { notesApiSlice } from "../notes/notesApiSlice";
import { useEffect } from "react";
import { Outlet } from "react-router-dom";

const PreFetch = () => {
  useEffect(() => {
    store.dispatch(
      notesApiSlice.util.prefetch("getNotes", "notesList", { force: true })
    );
    store.dispatch(
      notesApiSlice.util.prefetch("getUsers", "usersList", { force: true })
    );
  }, []);

  return <Outlet />;
};

export default PreFetch;
