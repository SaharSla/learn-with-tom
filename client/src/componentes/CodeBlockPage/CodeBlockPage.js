// CodeBlockPage.js

import React, { useEffect, useRef, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import io from 'socket.io-client';
import CodeMirror from '@uiw/react-codemirror';
import { javascript } from '@codemirror/lang-javascript';
import { oneDark } from '@codemirror/theme-one-dark';
import './CodeBlockPage.css'; // Import component styles

const CodeBlockPage = () => {
  const { id } = useParams();
  const [block, setBlock] = useState(null);
  const [loading, setLoading] = useState(true);
  const [role, setRole] = useState(null);
  const [isSolutionCorrect, setIsSolutionCorrect] = useState(false);
  const [usersCounter, setUsersCounter] = useState(0);
  const socketRef = useRef(null);

  // Connect to socket and handle real-time events
  useEffect(() => {
    socketRef.current = io('http://localhost:4001');
    socketRef.current.emit('joinRoom', id);

    socketRef.current.on('roleAssigned', (receivedRole) => {
      setUsersCounter((prev) => prev + 1);
      setRole(receivedRole);
    });

    socketRef.current.on('codeUpdated', (newCode) => {
      setBlock((prev) => (prev ? { ...prev, code: newCode } : { code: newCode }));
    });

    socketRef.current.on('usersCount', (count) => {
      setUsersCounter(count);
    });

    socketRef.current.on('mentorLeft', () => {
      alert('Mentor has left. Redirecting...');
      window.location.href = '/';
    });

    // Listen for solutionCorrect event from server
    socketRef.current.on('solutionCorrect', () => {
      setIsSolutionCorrect(true); // All students will see the smiley!
    });


    return () => {
      socketRef.current.disconnect();
    };
  }, [id]);

  // Fetch code block data from server
  useEffect(() => {
    fetch(`http://localhost:4001/api/codeblocks/${id}`)
      .then(res => res.json())
      .then(data => {
        setBlock(() => ({ ...data, code: data.code }));
        setLoading(false);
      })
      .catch(err => {
        console.error('Failed to fetch code block:', err);
        setLoading(false);
      });
  }, [id]);

  if (loading) return <p className="loading-message">Loading...</p>;
  if (!block) return <p className="error-message">Code block not found.</p>;

  return (
    <div className="codeblock-page-container">
      {/* Navigation link */}
      <Link to="/" className="back-link">← Back to Lobby</Link>

      {/* Block title and description */}
      <h1 className="codeblock-title">{block.title}</h1>
      {block.description && <p className="codeblock-description">{block.description}</p>}

      {/* Role badge and user counter */}
      <div className="info-bar">
        <span className={`role-badge ${role}`}>Role: {role}</span>
        <span className="user-count">🟢 {usersCounter} Students in Room</span>
      </div>

      {/* Code editor view */}
      {role === 'mentor' && (
        <CodeMirror
          value={block.code}
          height="300px"
          theme={oneDark}
          extensions={[javascript()]}
          readOnly={true}
          className="code-editor"
        />
      )}

      {role === 'student' && (
        <div className="editor-container">
          <CodeMirror
            value={block.code}
            height="300px"
            theme={oneDark}
            extensions={[javascript()]}
            onChange={(updatedCode) => {
              setBlock({ ...block, code: updatedCode });
              socketRef.current.emit('codeChanged', { blockId: id, code: updatedCode });
              setIsSolutionCorrect(updatedCode.trim() === block.solution.trim());
            }}
            className="code-editor"
          />
          {/* Show smiley if solution is correct */}
          {isSolutionCorrect && (
            <div className="smiley-display">😄</div>
          )}
        </div>
      )}
    </div>
  );
};

export default CodeBlockPage;
