// src/Channel/Channel.jsx
import React, { useState, useEffect, useCallback } from "react";
import { useAuth } from "../context/AuthProvider";
import { useChannelService } from "../hooks/useChannelService"; 
import { useUsers } from "../context/UsersProvider"; 
import "./Channel.css";
import { useMessages } from "../context/MessagesProvider";
import { useChannel } from "../context/ChannelProvider";

function Channel({ setEditButton }) {
  const {
    getChannels,
    createChannel: createChannelApi,
    isAuthenticated,
  } = useChannelService();
  const { currentUser } = useAuth();
  const { users, loading: usersLoading } = useUsers();
  const { loadMessages } = useMessages();
  const { selectChannel } = useChannel();

  const [channels, setChannels] = useState([]); // ADD LOCAL STATE
  const [loading, setLoading] = useState(false); // ADD LOCAL STATE
  const [error, setError] = useState(null); // ADD LOCAL STATE
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newChannelName, setNewChannelName] = useState("");
  const [userSearch, setUserSearch] = useState("");
  const [channelSearch, setChannelSearch] = useState("");
  
  // Fetch all channels under current user
  const fetchChannels = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const channelsData = await getChannels();
      setChannels(channelsData);
    } catch (err) {
      setError(err.message || "Failed to fetch channels");
      console.error("Error fetching channels:", err);
    } finally {
      setLoading(false);
    }
  }, [getChannels]);

  // Fetch channels on mount and when auth changes
  useEffect(() => {
    if (isAuthenticated) {
      fetchChannels();
    }
  }, [isAuthenticated, fetchChannels]);

  // Filter channels based on search
  const filteredChannels = channels.filter((channel) =>
    channel.name?.toLowerCase().includes(channelSearch.toLowerCase())
  );

  // Handle channel selection
  const handleChannelSelect = async (channel) => {
    selectChannel(channel);
    setEditButton(true);
    await loadMessages(channel.id);
    console.log("Channel:", channel)
  };

  // Handle creating a new channel
  const handleCreateChannel = async (e) => {
    e.preventDefault();

    // Validation
    if (!newChannelName.trim()) {
      alert("Channel name cannot be empty.");
      return;
    }

    if (selectedUsers.length === 0) {
      alert("Please select at least one user to invite.");
      return;
    }

    try {
      setLoading(true);
      setError(null);

      // Create channel with name and selected user IDs
      const newChannel = await createChannelApi({
        name: newChannelName.trim(),
        user_ids: selectedUsers.map((id) => parseInt(id)),
      });

      alert("Channel created successfully!");

      // Refresh channels list
      await fetchChannels();

      setIsModalOpen(false);
      setNewChannelName("");
      setSelectedUsers([]);

      // Select the newly created channel
      handleChannelSelect(newChannel);
    } catch (err) {
      setError(err.message || "Failed to create channel");
      console.error("Failed to create channel:", err);
    } finally {
      setLoading(false);
    }
  };

  // Filter users based on search
  const filteredUsers = users
    ? users.filter(
        (user) =>
          user.email?.toLowerCase().includes(userSearch.toLowerCase()) &&
          user.id !== currentUser?.id // Exclude current user
      )
    : [];

  return (
    <div className="channel-container">
      <h2 className="channel-header">Channels</h2>

      {loading && <div className="loading">Loading channels...</div>}
      {error && <div className="error">{error}</div>}

      <input
        className="search-bar"
        type="text"
        placeholder="Search channels..."
        value={channelSearch}
        onChange={(e) => setChannelSearch(e.target.value)}
        disabled={loading}
      />

      <ul className="channel-list-container">
        {filteredChannels.length > 0 ? (
          filteredChannels.map((channel) => (
            <li
              key={channel.id}
              className="group-list"
              onClick={() => !loading && handleChannelSelect(channel)}
            >
              <a className="group-name" href="#">{`# ${channel.name}`}</a>
            </li>
          ))
        ) : (
          <p className="no-results">
            {loading ? "Loading..." : "No channels found. Create one!"}
          </p>
        )}
      </ul>

      <button
        className="create-group-button"
        onClick={() => setIsModalOpen(true)}
        disabled={loading}
      >
        {loading ? "Creating..." : "Create Channel"}
      </button>

      {/* Modal for Channel Creation */}
      {isModalOpen && (
        <div className="modal">
          <div className="modal-content">
            <h3>Create New Channel</h3>

            <input
              className="enter-channel-name"
              type="text"
              placeholder="Enter #channel name"
              value={newChannelName}
              onChange={(e) => setNewChannelName(e.target.value)}
              disabled={loading}
            />

            <h4 className="invite-users">Invite Users</h4>

            <input
              type="text"
              placeholder="Search users..."
              value={userSearch}
              onChange={(e) => setUserSearch(e.target.value)}
              disabled={loading}
            />

            {usersLoading ? (
              <div className="loading">Loading users...</div>
            ) : (
              <div className="user-list">
                {filteredUsers.map((user) => (
                  <label key={user.id} className="user-item">
                    <input
                      className="checkbox"
                      type="checkbox"
                      value={user.id}
                      checked={selectedUsers.includes(String(user.id))}
                      onChange={(e) => {
                        const value = e.target.value;
                        setSelectedUsers((prev) =>
                          e.target.checked
                            ? [...prev, value]
                            : prev.filter((u) => u !== value)
                        );
                      }}
                      disabled={loading}
                    />
                    <span className="user-email">{user.email}</span>
                  </label>
                ))}
              </div>
            )}

            <div className="modal-buttons">
              <button
                className="create-button"
                onClick={handleCreateChannel}
                disabled={
                  loading ||
                  selectedUsers.length === 0 ||
                  !newChannelName.trim()
                }
              >
                {loading ? "Creating..." : "Create"}
              </button>

              <button
                onClick={() => setIsModalOpen(false)}
                className="cancel-button"
                disabled={loading}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Channel;
