import React, { useState, useEffect } from 'react';
import axios from 'axios';

const Dashboard = () => {
  const [folders, setFolders] = useState([]);
  const [selectedFolder, setSelectedFolder] = useState(null);
  const [files, setFiles] = useState([]);
  const [file, setFile] = useState(null);
  const [folderName, setFolderName] = useState('');

  useEffect(() => {
    axios.get('http://localhost:5000/api/media/folders', { withCredentials: true })
      .then(res => setFolders(res.data))
      .catch(() => window.location.href = '/');
  }, []);

  const createFolder = async () => {
    const res = await axios.post('http://localhost:5000/api/media/folder', { name: folderName }, { withCredentials: true });
    setFolders([...folders, res.data]);
    setFolderName('');
  };

  const deleteFolder = async (id) => {
    await axios.delete(`http://localhost:5000/api/media/folder/${id}`, { withCredentials: true });
    setFolders(folders.filter(f => f._id !== id));
    setSelectedFolder(null);
    setFiles([]);
  };

  const fetchFiles = async (folderId) => {
    setSelectedFolder(folderId);
    const res = await axios.get(`http://localhost:5000/api/media/files/${folderId}`, { withCredentials: true });
    setFiles(res.data);
  };

  const uploadFile = async () => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('folderId', selectedFolder);
    formData.append('folderName', folders.find(f => f._id === selectedFolder)?.name);

    const res = await axios.post('http://localhost:5000/api/media/upload', formData, {
      withCredentials: true,
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    setFiles([...files, res.data]);
  };

  const deleteFile = async (id) => {
    await axios.delete(`http://localhost:5000/api/media/file/${id}`, { withCredentials: true });
    setFiles(files.filter(f => f._id !== id));
  };

  const renameFile = async (id) => {
    const newName = prompt('Enter new name:');
    const res = await axios.put(`http://localhost:5000/api/media/file/${id}`, { newName }, { withCredentials: true });
    setFiles(files.map(f => f._id === id ? res.data : f));
  };

  const logout = async () => {
    await axios.get('http://localhost:5000/api/auth/logout', { withCredentials: true });
    window.location.href = '/';
  };

  return (
    <div>
      <h2>Media Vault</h2>
      <button onClick={logout}>Logout</button>

      <h3>Create Folder</h3>
      <input placeholder="Folder name" value={folderName} onChange={e => setFolderName(e.target.value)} />
      <button onClick={createFolder}>Create</button>

      <h3>Your Folders</h3>
      {folders.map(folder => (
        <div key={folder._id}>
          <button onClick={() => fetchFiles(folder._id)}>{folder.name}</button>
          <button onClick={() => deleteFolder(folder._id)}>🗑️</button>
        </div>
      ))}

      {selectedFolder && (
        <div>
          <h3>Files in Folder</h3>
          <input type="file" onChange={e => setFile(e.target.files[0])} />
          <button onClick={uploadFile}>Upload</button>

          <ul>
            {files.map(f => (
              <li key={f._id}>
                <a href={f.url} target="_blank" rel="noopener noreferrer">{f.name}</a>
                <button onClick={() => renameFile(f._id)}>✏️</button>
                <button onClick={() => deleteFile(f._id)}>🗑️</button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default Dashboard;