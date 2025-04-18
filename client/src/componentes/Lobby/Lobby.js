import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import "./Lobby.css";

const Lobby = () => {
  const [blocks, setBlocks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('http://localhost:4001/api/codeblocks')
      .then((res) => res.json())
      .then((data) => {
        setBlocks(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error('Failed to fetch code blocks:', err);
        setLoading(false);
      });
  }, []);

  if (loading) return <p className="loading-text">Loading code blocks...</p>;

  return (
    <div className="lobby-container">
      <h1 className="lobby-title">Choose code block</h1>
      <ul className="block-list">
        {blocks.map((block) => (
          <li key={block._id} className="block-item">
            <Link to={`/block/${block._id}`} className="block-link">
              <h3 className="block-title">{block.title}</h3>
              <p className="block-description">{block.description}</p>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default Lobby;
