import {API_BASE} from "../utils/constants";
import {baseHeaders} from "../utils/request";

const Workspace = {
  new: async function (data = {}) {
    const {workspace, message} = await fetch(`${API_BASE}/workspace/new`, {
      method: "POST",
      body: JSON.stringify(data),
      headers: baseHeaders()
    })
      .then((res) => res.json())
      .catch((e) => {
        return {workspace: null, message: e.message};
      });

    return {workspace, message};
  },
  update: async function (slug, data = {}) {
    const {workspace, message} = await fetch(
      `${API_BASE}/workspace/${slug}/update`,
      {
        method: "POST",
        body: JSON.stringify(data),
        headers: baseHeaders()
      }
    )
      .then((res) => res.json())
      .catch((e) => {
        return {workspace: null, message: e.message};
      });

    return {workspace, message};
  },
  modifyEmbeddings: async function (slug, changes = {}) {
    const {workspace, message} = await fetch(
      `${API_BASE}/workspace/${slug}/update-embeddings`,
      {
        method: "POST",
        body: JSON.stringify(changes), // contains 'adds' and 'removes' keys that are arrays of filepaths
        headers: baseHeaders()
      }
    )
      .then((res) => res.json())
      .catch((e) => {
        return {workspace: null, message: e.message};
      });

    return {workspace, message};
  },
  chatHistory: async function (slug) {
    return await fetch(`${API_BASE}/workspace/${slug}/chats`, {
      method: "GET",
      headers: baseHeaders()
    })
      .then((res) => res.json())
      .then((res) => res.history || [])
      .catch(() => []);
  },
  sendChat: async function ({slug}, message, mode = "query") {
    return await fetch(`${API_BASE}/workspace/${slug}/chat`, {
      method: "POST",
      body: JSON.stringify({message, mode}),
      headers: baseHeaders()
    })
      .then((res) => res.json())
      .catch((e) => {
        console.error(e);
        return null;
      });
  },
  sendCoder: async function ({slug}, message, mode = "analyst") {
    return await fetch(`${API_BASE}/analyst/${slug}/analyst`, {
      method: "POST",
      body: JSON.stringify({message, mode}),
      headers: baseHeaders()
    })
      .then((res) => res.json())
      .catch((e) => {
        console.error(e);
        return null;
      });
  },
  all: async function () {
    return await fetch(`${API_BASE}/workspaces`, {
      method: "GET",
      headers: baseHeaders()
    })
      .then((res) => res.json())
      .then((res) => res.workspaces || [])
      .catch(() => []);
  },
  bySlug: async function (slug = "") {
    return await fetch(`${API_BASE}/workspace/${slug}`, {
      headers: baseHeaders()
    })
      .then((res) => res.json())
      .then((res) => res.workspace)
      .catch(() => null);
  },
  delete: async function (slug) {
    return await fetch(`${API_BASE}/workspace/${slug}`, {
      method: "DELETE",
      headers: baseHeaders()
    })
      .then((res) => res.ok)
      .catch(() => false);
  },
  uploadFile: async function (slug, formData) {
    const response = await fetch(`${API_BASE}/workspace/${slug}/upload`, {
      method: "POST",
      body: formData,
      headers: baseHeaders()
    });

    const data = await response.json();
    return {response, data};
  },
  uploadCsvFile: async function (slug, formData) {
    const response = await fetch(`${API_BASE}/workspace/${slug}/upload_csv`, {
      method: "POST",
      body: formData,
      headers: baseHeaders()
    });

    const data = await response.json();
    return {response, data};
  }
};

export default Workspace;
