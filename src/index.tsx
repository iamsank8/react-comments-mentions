import * as React from 'react'
import CommentSectionComponent from './components/CommentSectionComponent/Index'
import GlobalProvider, {
  DEFAULT_MENTION_TRIGGERS,
  MentionsObject,
  OnHashMentionSearch,
  OnMentionSearch
} from './context/Provider'
import './Index.scss'
import { EditorState } from 'draft-js'

interface CommentSectionProps {
  currentUser: {
    currentUserId: string
    currentUserImg: string
    currentUserProfile: string
    currentUserFullName: string
  } | null
  logIn: {
    loginLink: string
    signupLink: string
  }
  replyTop?: boolean
  customImg?: string
  inputStyle?: object
  formStyle?: object
  submitBtnStyle?: object
  cancelBtnStyle?: object
  overlayStyle?: object
  imgStyle?: object
  replyInputStyle?: object
  commentsCount?: number
  hrStyle?: object
  titleStyle?: object
  onSubmitAction?: Function
  onDeleteAction?: Function
  onReplyAction?: Function
  onEditAction?: Function
  customNoComment?: Function
  currentData?: Function
  removeEmoji?: boolean
  advancedInput?: boolean
  /** Overrides default Draft.js placeholder when `advancedInput` is true. */
  advancedInputPlaceholder?: string
  commentData: Array<{
    userId: string
    comId: string
    fullName: string
    avatarUrl: string
    text: string
    userProfile?: string
    editorText: EditorState
    replies?:
      | Array<{
          userId: string
          comId: string
          fullName: string
          avatarUrl: string
          text: string
          editorText: EditorState
          userProfile?: string
        }>
      | undefined
  }>
  mentionSuggestions?: MentionsObject
  /** Mention prefix characters for both advanced and default inputs. Defaults to `['@', '#']`. */
  mentionTriggers?: string[]
  onMentionSearch?: OnMentionSearch
  /** @deprecated Use `onMentionSearch` instead. */
  onHashMentionSearch?: OnHashMentionSearch
  hideToolbar?: boolean
  isEditable?: boolean
  isAbleToDelete?: boolean
  showActionMenu?: boolean
  isAbleToReply?: boolean
  isAuthenticated?: boolean
}

export const CommentSection = ({
  currentUser,
  customImg,
  inputStyle,
  formStyle,
  submitBtnStyle,
  cancelBtnStyle,
  overlayStyle,
  replyInputStyle,
  logIn,
  imgStyle,
  replyTop,
  commentsCount,
  commentData,
  hrStyle,
  titleStyle,
  removeEmoji,
  onSubmitAction,
  onDeleteAction,
  onReplyAction,
  onEditAction,
  customNoComment,
  currentData,
  advancedInput,
  advancedInputPlaceholder,
  mentionSuggestions,
  mentionTriggers,
  onMentionSearch,
  onHashMentionSearch,
  hideToolbar,
  isEditable,
  isAbleToDelete,
  isAbleToReply,
  showActionMenu,
  isAuthenticated
}: CommentSectionProps) => {
  return (
    <GlobalProvider
      currentUser={currentUser}
      replyTop={replyTop}
      customImg={customImg}
      inputStyle={inputStyle}
      formStyle={formStyle}
      submitBtnStyle={submitBtnStyle}
      cancelBtnStyle={cancelBtnStyle}
      replyInputStyle={replyInputStyle}
      imgStyle={imgStyle}
      commentsCount={commentsCount}
      commentData={commentData}
      onSubmitAction={onSubmitAction}
      onDeleteAction={onDeleteAction}
      onReplyAction={onReplyAction}
      onEditAction={onEditAction}
      currentData={currentData}
      removeEmoji={removeEmoji}
      advancedInput={advancedInput}
      advancedInputPlaceholder={advancedInputPlaceholder}
      mentionSuggestions={mentionSuggestions}
      mentionTriggers={mentionTriggers}
      onMentionSearch={onMentionSearch}
      onHashMentionSearch={onHashMentionSearch}
      hideToolbar={hideToolbar}
      isEditable={isEditable}
      isAbleToDelete={isAbleToDelete}
      isAbleToReply={isAbleToReply}
      showActionMenu={showActionMenu}
      isAuthenticated={isAuthenticated}
    >
      <CommentSectionComponent
        overlayStyle={overlayStyle}
        hrStyle={hrStyle}
        logIn={logIn}
        titleStyle={titleStyle}
        customNoComment={customNoComment}
      />
    </GlobalProvider>
  )
}

export type { MentionsObject, OnMentionSearch, OnHashMentionSearch }
export { DEFAULT_MENTION_TRIGGERS }
export { triggerFromMentionEntityType } from './components/CommentStructure.tsx/Index'
