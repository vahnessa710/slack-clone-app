import { useUsers } from "../context/UsersProvider";
import { useChannel } from "../context/ChannelProvider"
import { useState } from "react"

function DirectMsg({
  setReceiver,
  setChannel,
  setEditButton,
}) {
  const { users } = useUsers();
  const { selectChannel, openOrCreateDM } = useChannel();
  const [ userSearch, setUserSearch ]= useState("");
  const filteredUsers = users.filter((u) =>
    u.email.toLowerCase().includes(userSearch.toLowerCase())
  );
  
  return (
    <>
      <h2 className="dm-header">Direct messages</h2>
      <input
        className="search-bar"
        type="text"
        placeholder="Search users..."
        value={userSearch}
        onChange={(e) => setUserSearch(e.target.value)}
      />
      <ul className="userList-container">
        {filteredUsers.length > 0 ? (
          filteredUsers.map((individual) => {
            const { id, email } = individual;
            return (
              <div className="userList-individual" key={id}>
                <div onClick={() => openOrCreateDM(id)}>
                <p>{email.split("@")[0]}</p>
                </div>
              </div>
            );
          })
        ) : (
          <div className="no-results">No users found.</div>
        )}
      </ul>
    </>
  );
}

export default DirectMsg;
