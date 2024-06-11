import { useRef, useEffect } from "react";
import styles from "./Chat.module.scss";
import MessageInput from "./MessageInput";
import ChatHeader from "./ChatHeader";
import Message from "./Message";

// temporary
import defaultUserPic from "../../assets/default_user_1.png";
import { useDispatch, useSelector } from "react-redux";
import { active, minimised, getAllChats } from "../../features/chats/chatSlice";
import Call from "../call/Call";
import { createSelector, current } from "@reduxjs/toolkit";
import Modal from "../Modal";
import { modalClose } from "../../features/user/userSlice";
import { MdCall, MdCallEnd, MdLocalPhone } from "react-icons/md";
import { rtcActions } from "../../features/webrtc/rtcSlice";

const DUMMY_MESSAGES = [
  {
    id: 1,
    type: "sent",
    picture: defaultUserPic,
    username: "John Doe",
    timestamp: "20:23",
    message: "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore.",
  },
  {
    id: 2,
    type: "received",
    picture: defaultUserPic,
    username: "John Doe",
    timestamp: "20:23",
    message: "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore.",
  },
  {
    id: 3,
    type: "sent",
    picture: defaultUserPic,
    username: "John Doe",
    timestamp: "20:23",
    message: "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore.",
  },
  {
    id: 4,
    type: "received",
    picture: defaultUserPic,
    username: "John Doe",
    timestamp: "20:23",
    message: "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore.",
  },
  {
    id: 5,
    type: "sent",
    picture: defaultUserPic,
    username: "John Doe",
    timestamp: "20:23",
    message: "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore.",
  },
  {
    id: 6,
    type: "received",
    picture: defaultUserPic,
    username: "John Doe",
    timestamp: "20:23",
    message: "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore.",
  },
  {
    id: 7,
    type: "sent",
    picture: defaultUserPic,
    username: "John Doe",
    timestamp: "20:23",
    message: "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore.",
  },
  {
    id: 8,
    type: "received",
    picture: defaultUserPic,
    username: "John Doe",
    timestamp: "20:23",
    message: "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore.",
  },
];

const selectAllUserChats = (state) => state.chats.allUserChats;
const selectCurrentChat = (state) => state.chats.currentChat;
const selectMessagesByChatId = (state) => state.messages.byChatId;

const selectCurrentChatInfo = createSelector([selectAllUserChats, selectCurrentChat], (allUserChats, currentChat) =>
  allUserChats.find((chat) => chat.chat_id === currentChat)
);

const selectCurrentChatMessages = createSelector(
  [selectMessagesByChatId, selectCurrentChat],
  (messagesByChatId, currentChat) => messagesByChatId[currentChat] || []
);

function Chat() {
  const scrollableContainerRef = useRef(null);
  const dispatch = useDispatch();
  const callPanelStatus = useSelector((state) => state.chats.callPanelStatus);
  const currentChat = useSelector((state) => state.chats.currentChat);
  const isModalOpen = useSelector((state) => state.users.modalOpen);

  const closeModal = () => {
    dispatch(modalClose());
  };

  const acceptCall = () => {
    dispatch(active());
    dispatch(modalClose());
    dispatch(rtcActions.handleReceivingCall());
  };

  const declineCall = () => {
    dispatch(modalClose());
  };

  const currentChatInfo = useSelector(selectCurrentChatInfo);
  const messages = useSelector(selectCurrentChatMessages);

  useEffect(() => {
    const scrollableContainer = scrollableContainerRef.current;

    if (scrollableContainer) {
      scrollableContainer.scrollTop = scrollableContainer.scrollHeight;
    }
  }, [messages]);

  useEffect(() => {
    dispatch(getAllChats());
  }, [dispatch]);

  return (
    <div className={styles.pageContainer}>
      <Modal open={isModalOpen} close={closeModal}>
        <div className={styles.callPrompt}>
          <div className={styles.callPrompt__image}>
            <img src={defaultUserPic} className={styles.callPrompt__img} alt="" />
          </div>
        </div>
        <div className={styles.callPrompt__name}>John Doe</div>
        <div className={styles.callPrompt__container}>
          <button onClick={declineCall} className={styles.callPrompt__reject}>
            <MdCallEnd /> <span>Decline</span>
          </button>
          <button onClick={acceptCall} className={styles.callPrompt__accept}>
            <MdLocalPhone />
            <span>Accept</span>
          </button>
        </div>
      </Modal>
      <ChatHeader profilePic={defaultUserPic} name={currentChatInfo?.chat_name} and status={true} />
      {callPanelStatus === "minimised" && <Call />}
      <div className={styles.scrollContainer} ref={scrollableContainerRef}>
        <div className={styles.conversationContainer}>
          {messages.map((message, index) => {
            const previousMessage = index > 0 ? messages[index - 1] : null;
            return (
              <Message
                key={message.id}
                type={message.type}
                picture={defaultUserPic}
                //picture={message.picture}
                username={message.from}
                timestamp={message.sent}
                message={message.message_text}
                from={message.from}
                isEdited={message.isEdited}
                previousMessage={previousMessage}
              />
            );
          })}
        </div>
      </div>
      <MessageInput />
    </div>
  );
}

export default Chat;
