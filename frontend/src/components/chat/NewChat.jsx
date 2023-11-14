import styles from "./NewChat.module.scss";
import { useState, useRef } from "react";
import { RxCross2 } from "react-icons/rx";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { reset as resetChatState } from "../../features/chats/chatSlice";
import { createChat } from "../../features/chats/chatSlice";
import { reset as resetFriendsState } from "../../features/friends/friendsSlice";
import { getAllFriends } from "../../features/friends/friendsSlice";

// temporary
import defaultUserPic from "../../assets/default_user_1.png";

function NewChat() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { status: chatStatus, error: chatError } = useSelector((state) => state.chats);
  const { status: friendsStatus, error: friendsError, friendsList } = useSelector((state) => state.friends);

  const [searchText, setSearchText] = useState("");
  const [selectedUsers, setSelectedUsers] = useState([]);

  const searchScrollRef = useRef(null);

  useEffect(() => {
    dispatch(getAllFriends());
  }, []);

  useEffect(() => {
    if (chatStatus === "failed") {
      // TODO show error
      console.log(chatError);
    }
    // TODO this will need some additional checks
    if (chatStatus === "succeeded") {
      navigate("/chats");

      return () => {
        dispatch(resetChatState());
        dispatch(resetFriendsState());
      };
    }
  }, [chatStatus, navigate, chatError]);

  useEffect(() => {
    // Scroll to the end when the content changes
    if (searchScrollRef.current) {
      searchScrollRef.current.scrollLeft = searchScrollRef.current.scrollWidth;
    }
  }, [selectedUsers]);

  const handleSearchChange = (event) => {
    setSearchText(event.target.value);
  };

  // TODO: possibly improve search
  // NOTE: this is a very simple search implementation,
  // should be an api call to the backend or sth
  const filteredUsers = friendsList.filter((user) => user.username.toLowerCase().includes(searchText.toLowerCase()));

  const handleUserCheckboxChange = (userId) => {
    setSelectedUsers((prevSelectedUsers) => {
      const userIndex = prevSelectedUsers.findIndex((prevUserId) => prevUserId === userId);
      if (userIndex === -1) {
        // User not found, add the user
        return [...prevSelectedUsers, userId];
      } else {
        // User found, remove the user from the array
        const updatedUsers = [...prevSelectedUsers];
        updatedUsers.splice(userIndex, 1);
        return updatedUsers;
      }
    });
  };

  const handleRemoveUser = (userId) => {
    setSelectedUsers((prevSelectedUsers) => {
      const userIndex = prevSelectedUsers.findIndex((prevUserId) => prevUserId === userId);

      const updatedUsers = [...prevSelectedUsers];
      updatedUsers.splice(userIndex, 1);
      return updatedUsers;
    });
  };

  const handleClearInput = () => {
    setSearchText("");
    setSelectedUsers([]);
  };

  const handleCreateChat = () => {
    if (selectedUsers.length === 0) {
      // TODO show error
      console.log("No users selected");
      return;
    }

    const newChatData = {
      isPrivate: false, // TODO
      members: selectedUsers.map((user) => user.username),
    };
    console.log(newChatData);
    dispatch(createChat(newChatData));
  };

  return (
    <div className={styles.newChat}>
      <div className={styles.searchContainer} ref={searchScrollRef}>
        {selectedUsers.length > 0 &&
          selectedUsers.map((user) => (
            <div key={user.username} className={styles.searchContainer__selectedUser}>
              <span key={user.username} className={styles.searchContainer__username}>
                {`${user.username}`}
              </span>
              <RxCross2 className={styles.searchContainer__close} onClick={() => handleRemoveUser(user.username)} />
            </div>
          ))}
        <input
          type="text"
          value={searchText}
          onChange={handleSearchChange}
          placeholder="Search or start new chat"
          className={styles.searchContainer__input}
        />
        <button className={styles.searchContainer__clear} onClick={handleClearInput}>
          <RxCross2 className={styles.searchContainer__clearButton} />
        </button>
      </div>
      <ul className={styles.userList}>
        {filteredUsers.map((user) => (
          <li key={user.username} className={styles.userList__item}>
            <div className={styles.userList__leftContainer}>
              <div className={styles.userList__imageContainer}>
                <img className={styles.userList__img} src={defaultUserPic} alt={"" /* TODO make this dynamic*/} />
              </div>
              <span className={styles.userList__username}>{user.username}</span>
            </div>
            <input
              type="checkbox"
              key={user.username}
              checked={selectedUsers.some((selectedUser) => selectedUser.username === user.username)}
              onChange={() => handleUserCheckboxChange(user)}
              className={styles.userList__checkbox}
            />
          </li>
        ))}
      </ul>
      <div className={styles.createChat}>
        <button
          className={styles.createChat__button}
          onClick={handleCreateChat}
          disabled={false /* TODO */}
          type="submit"
        >
          Create Chat
        </button>
      </div>
    </div>
  );
}

export default NewChat;
