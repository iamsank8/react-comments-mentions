import React, { createContext, useEffect, useState } from 'react'
// const { v4: uuidv4 } = require('uuid')
import _ from 'lodash'
import { MentionData } from '@draft-js-plugins/mention';
import { EditorState } from 'draft-js';

export const GlobalContext = createContext({})

export const DEFAULT_MENTION_TRIGGERS: string[] = ['@', '#']

/** Async lookup for any mention trigger; use with `mentionSuggestions[trigger]` for empty-query preload. */
export type OnMentionSearch = (
  trigger: string,
  query: string
) => Promise<MentionData[]>

/** @deprecated Use {@link OnMentionSearch} with `onMentionSearch`; for `#` only, still supported. */
export type OnHashMentionSearch = (query: string) => Promise<MentionData[]>

export type MentionsObject = Record<string, MentionData[]>
export const GlobalProvider = ({
  children,
  currentUser,
  replyTop,
  customImg,
  inputStyle,
  formStyle,
  submitBtnStyle,
  cancelBtnStyle,
  imgStyle,
  commentsCount,
  commentData,
  onSubmitAction,
  onDeleteAction,
  onReplyAction,
  onEditAction,
  currentData,
  replyInputStyle,
  removeEmoji,
  advancedInput,
  advancedInputPlaceholder,
  mentionSuggestions,
  mentionTriggers = DEFAULT_MENTION_TRIGGERS,
  onMentionSearch,
  onHashMentionSearch,
  hideToolbar,
  isAbleToDelete = true,
  isEditable = true,
  showActionMenu = true,
  isAbleToReply = true,
  isAuthenticated
}: {
  children: any
  currentUser?: {
    currentUserId: string
    currentUserImg: string
    currentUserProfile?: string | undefined
    currentUserFullName: string
  } | null
  replyTop?: boolean
  customImg?: string
  inputStyle?: object
  formStyle?: object
  submitBtnStyle?: object
  cancelBtnStyle?: object
  imgStyle?: object
  replyInputStyle?: object
  commentsCount?: number
  removeEmoji?: boolean
  commentData?: Array<{
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
          userProfile?: string
          editorText: EditorState
        }>
      | undefined
  }>
  onSubmitAction?: Function
  onDeleteAction?: Function
  onReplyAction?: Function
  onEditAction?: Function
  currentData?: Function
  advancedInput?: boolean
  /** Overrides default Draft.js mention hint when `advancedInput` is true. */
  advancedInputPlaceholder?: string
  mentionSuggestions?: MentionsObject
  /** Triggers that open the mention suggestion list (Draft.js advanced input). Defaults to `['@', '#']`. */
  mentionTriggers?: string[]
  /** Server or async suggestions; non-empty `query` uses this when provided. Empty query uses `mentionSuggestions[trigger]`. */
  onMentionSearch?: OnMentionSearch
  /**
   * @deprecated Prefer `onMentionSearch`. When set and `onMentionSearch` is not, used only for trigger `#`.
   */
  onHashMentionSearch?: OnHashMentionSearch
  hideToolbar?: boolean
  isEditable?: boolean
  isAbleToDelete?: boolean
  showActionMenu?: boolean
  isAbleToReply?: boolean
  isAuthenticated?: boolean
}) => {
  const [currentUserData] = useState(currentUser)
  const [data, setData] = useState<
    Array<{
      userId: string
      comId: string
      fullName: string
      avatarUrl: string
      text: string
      userProfile?: string
      editorText?: EditorState
      replies?:
        | Array<{
            userId: string
            comId: string
            fullName: string
            avatarUrl: string
            text: string
            userProfile?: string
            editorText?: EditorState
          }>
        | undefined
    }>
  >([])
  const [editArr, setEdit] = useState<string[]>([])
  const [replyArr, setReply] = useState<string[]>([])

  useEffect(() => {
    if (commentData) {
      setData(commentData)
    }
  }, [commentData])


  useEffect(() => {
    if (currentData) {
      currentData(data)
    }
  }, [data])

  const handleAction = (id: string, edit: boolean) => {
    if (edit) {
      let editArrCopy: string[] = [...editArr]
      let indexOfId = _.indexOf(editArrCopy, id)
      if (_.includes(editArr, id)) {
        editArrCopy.splice(indexOfId, 1)
        setEdit(editArrCopy)
      } else {
        editArrCopy.push(id)
        setEdit(editArrCopy)
      }
    } else {
      let replyArrCopy: string[] = [...replyArr]
      let indexOfId = _.indexOf(replyArrCopy, id)
      if (_.includes(replyArr, id)) {
        replyArrCopy.splice(indexOfId, 1)
        setReply(replyArrCopy)
      } else {
        replyArrCopy.push(id)
        setReply(replyArrCopy)
      }
    }
  }

  const onSubmit = (text: string, uuid: string, editorText?: EditorState) => {
    let copyData = [...data]
    copyData.push({
      userId: currentUserData!.currentUserId,
      comId: uuid,
      avatarUrl: currentUserData!.currentUserImg,
      userProfile: currentUserData!.currentUserProfile
        ? currentUserData!.currentUserProfile
        : undefined,
      fullName: currentUserData!.currentUserFullName,
      text: text,
      editorText: editorText,
      replies: []
    })
    setData(copyData)
  }

  const onEdit = (text: string, comId: string, parentId: string, editorText: EditorState) => {
    let copyData = [...data]
    if (parentId) {
      const indexOfParent = _.findIndex(copyData, { comId: parentId })
      const indexOfId = _.findIndex(copyData[indexOfParent].replies, {
        comId: comId
      })
      copyData[indexOfParent].replies![indexOfId].text = text
      copyData[indexOfParent].replies![indexOfId].editorText = editorText
      setData(copyData)
      handleAction(comId, true)
    } else {
      const indexOfId = _.findIndex(copyData, { comId: comId })
      copyData[indexOfId].text = text
      copyData[indexOfId].editorText = editorText
      setData(copyData)
      handleAction(comId, true)
    }
  }

  const onReply = (
    text: string,
    comId: string,
    parentId: string,
    uuid: string,
    editorText: EditorState
  ) => {
    let copyData = [...data]
    if (parentId) {
      const indexOfParent = _.findIndex(copyData, { comId: parentId })
      copyData[indexOfParent].replies!.push({
        userId: currentUserData!.currentUserId,
        comId: uuid,
        avatarUrl: currentUserData!.currentUserImg,
        userProfile: currentUserData!.currentUserProfile
          ? currentUserData!.currentUserProfile
          : undefined,
        fullName: currentUserData!.currentUserFullName,
        text: text,
        editorText: editorText
      })
      setData(copyData)
      handleAction(comId, false)
    } else {
      const indexOfId = _.findIndex(copyData, {
        comId: comId
      })
      copyData[indexOfId].replies!.push({
        userId: currentUserData!.currentUserId,
        comId: uuid,
        avatarUrl: currentUserData!.currentUserImg,
        userProfile: currentUserData!.currentUserProfile
          ? currentUserData!.currentUserProfile
          : undefined,
        fullName: currentUserData!.currentUserFullName,
        text: text,
        editorText: editorText
      })
      setData(copyData)
      handleAction(comId, false)
    }
  }

  const resolvedMentionTriggers =
    mentionTriggers.length > 0 ? mentionTriggers : DEFAULT_MENTION_TRIGGERS

  const onDelete = (comId: string, parentId: string) => {
    let copyData = [...data]
    if (parentId) {
      const indexOfParent = _.findIndex(copyData, { comId: parentId })
      const indexOfId = _.findIndex(copyData[indexOfParent].replies, {
        comId: comId
      })
      copyData[indexOfParent].replies!.splice(indexOfId, 1)
      setData(copyData)
    } else {
      const indexOfId = _.findIndex(copyData, { comId: comId })
      copyData.splice(indexOfId, 1)
      setData(copyData)
    }
  }

  return (
    <GlobalContext.Provider
      value={{
        currentUserData: currentUserData,
        replyTop: replyTop,
        data: data,
        handleAction: handleAction,
        editArr: editArr,
        onSubmit: onSubmit,
        onEdit: onEdit,
        replyArr: replyArr,
        onReply: onReply,
        onDelete: onDelete,
        customImg: customImg,
        inputStyle: inputStyle,
        formStyle: formStyle,
        submitBtnStyle: submitBtnStyle,
        cancelBtnStyle: cancelBtnStyle,
        imgStyle: imgStyle,
        commentsCount: commentsCount,
        onSubmitAction: onSubmitAction,
        onDeleteAction: onDeleteAction,
        onReplyAction: onReplyAction,
        onEditAction: onEditAction,
        replyInputStyle: replyInputStyle,
        removeEmoji: removeEmoji,
        advancedInput: advancedInput,
        advancedInputPlaceholder: advancedInputPlaceholder,
        mentionSuggestions: mentionSuggestions,
        mentionTriggers: resolvedMentionTriggers,
        onMentionSearch: onMentionSearch,
        onHashMentionSearch: onHashMentionSearch,
        hideToolbar: hideToolbar,
        isEditable: isEditable,
        isAbleToDelete: isAbleToDelete,
        showActionMenu: showActionMenu,
        isAbleToReply: isAbleToReply,
        isAuthenticated: isAuthenticated
      }}
    >
      {children}
    </GlobalContext.Provider>
  )
}

export default GlobalProvider
