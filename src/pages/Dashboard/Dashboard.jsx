import { useState } from "react";
import "./Dashboard.css";
import Channel from "../../Channel/Channel.jsx";
import NavBar from "../../NavBar/NavBar.jsx";
import Chat from "../../Chat/Chat.jsx";
import Profile from "/home/ryan/vahnessa/slack-clone-app/src/Profile/Profile.jsx";
import Primary from "../../Primary/Primary.jsx";
import DirectMsg from "../../DirectMsg/DirectMsg.jsx";
import { useChannel } from "../../context/ChannelProvider";

function Dashboard() {
  const { currentChannel, selectChannel } = useChannel();
  const [editButton, setEditButton] = useState(false);
  const [primary, setPrimary] = useState(false);
  return (
    <>
      <NavBar primary={primary} setPrimary={setPrimary} />

      <Primary primary={primary} setPrimary={setPrimary} />

      <div className="dashboard-container">
        <div className="channel-bar">
          <Channel
            primary={primary}
            setPrimary={setPrimary}
            editButton={editButton}
            setEditButton={setEditButton}
          />

          <DirectMsg />
        </div>

        <Chat
          channel={currentChannel}
          editButton={editButton}
          setEditButton={setEditButton}
        />

        {/* <Profile
          receiver={receiver}
          setReceiver={setReceiver}
          channel={channel}
          setChannel={setChannel}
          userList={userList}
          messages={messages}
          setMessages={setMessages}
          channelDetails={channelDetails}
          channelMembers={channelMembers}
          setChannelMembers={setChannelMembers}
        /> */}
      </div>
    </>
  );
}

export default Dashboard;
