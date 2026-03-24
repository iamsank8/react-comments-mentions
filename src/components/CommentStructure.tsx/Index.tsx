import './CommentStructure.scss'
import { useContext } from 'react'
import { GlobalContext } from '../../context/Provider'
import InputField from '../InputField/Index'
import { Menu, MenuItem } from '@szhsin/react-menu'
import '@szhsin/react-menu/dist/core.css'
import DeleteModal from './DeleteModal'
import React from 'react'
import { EditorState } from 'draft-js'

interface CommentStructureProps {
  info: {
    userId: string
    comId: string
    fullName: string
    avatarUrl: string
    text: string
    userProfile?: string
    timestamp: string
    replies?: Array<object> | undefined
    editorText?: EditorState
  }
  editMode: boolean
  parentId?: string
  replyMode: boolean
  logIn: {
    loginLink: string
    signupLink: string
  }
}

const CommentStructure = ({
  info,
  editMode,
  parentId,
  replyMode
}: CommentStructureProps) => {
  const globalStore: any = useContext(GlobalContext)
  const currentUser = globalStore.currentUserData

  const optionsMenu = () => {
    return (
      <div className='userActions'>
        {info.userId === currentUser.currentUserId && (
          <Menu
            menuButton={
              <button className='actionsBtn'>
                {' '}
                <div className='optionIcon' />
              </button>
            }
          >
            {
              globalStore.isEditable &&
              <MenuItem
                onClick={() => globalStore.handleAction(info.comId, true)}
              >
                edit
              </MenuItem>
            }
            {
              globalStore.isAbleToDelete && 
              <MenuItem>
                <DeleteModal comId={info.comId} parentId={parentId} />
              </MenuItem>
            }
          </Menu>
        )}
      </div>
    )
  }

  const userInfo = () => {
    return (
      <div className='commentsTwo'>
        <a className='userLink' target='_blank' href={info.userProfile}>
          <div>
            <img
              src={info.avatarUrl}
              alt='userIcon'
              className='imgdefault'
              style={
                globalStore.imgStyle ||
                (!globalStore.replyTop
                  ? { position: 'relative', top: 7 }
                  : null)
              }
            />
          </div>
          <div className='fullName'>{info.fullName} </div>
        </a>
      </div>
    )
  }

  const replyTopSection = () => {
    return (
      <div className='halfDiv'>
        <div className='userInfo'>
          <div>{info.text}</div>
          {userInfo()}
        </div>
        {globalStore.showActionMenu && (globalStore.isAbleToDelete || globalStore.isEditable) && currentUser && optionsMenu()}
      </div>
    )
  }

  const replyBottomSection = () => {
    return (
      <div className='halfDiv'>
        <div className='userInfo'>
          {userInfo()}
          {globalStore.advancedInput ? (
            <div
              className='infoStyle'
              dangerouslySetInnerHTML={{
                __html: convertJsonToHtml(JSON.parse(info.text)),
              }}
            />
          ) : (
            <div className='infoStyle'>{info.text}</div>
          )}
          <div style={{ marginLeft: 32 }}>
            {' '}
            {globalStore.isAbleToReply && currentUser && (
              <div>
                <button
                  className='replyBtn'
                  onClick={() => globalStore.handleAction(info.comId, false)}
                >
                  <div className='replyIcon' />
                  <span style={{ marginLeft: 17 }}>Reply</span>
                </button>
                <sub style={{ fontSize: 'medium' }}>{info.timestamp}</sub>
              </div>
            )}
          </div>
        </div>
        {globalStore.showActionMenu && (globalStore.isAbleToDelete || globalStore.isEditable) && currentUser && optionsMenu()}
      </div>
    )
  }

  const actionModeSection = (mode: string) => {
    if (mode === 'reply') {
      return (
        <div className='replysection'>
          {globalStore.replyTop ? replyTopSection() : replyBottomSection()}
          <InputField
            formStyle={{
              backgroundColor: 'transparent',
              padding: '20px 0px',
              marginLeft: '-15px'
            }}
            comId={info.comId}
            fillerText={''}
            mode={'replyMode'}
            parentId={parentId}
          />
        </div>
      )
    } else {
      return (
        <InputField
          formStyle={{
            backgroundColor: 'transparent',
            padding: '20px 0px',
            marginLeft: '-15px'
          }}
          comId={info.comId}
          fillerText={info.text}
          mode={'editMode'}
          parentId={parentId}
          editorText={info.editorText}
        />
      )
    }
  }

  return (
    <div>
      {editMode
        ? actionModeSection('edit')
        : replyMode
        ? actionModeSection('reply')
        : globalStore.replyTop
        ? replyTopSection()
        : replyBottomSection()}
    </div>
  )
}

/** Derives the trigger character(s) from @draft-js-plugins/mention entity type (`mention` → `@`, `#mention` → `#`). */
export function triggerFromMentionEntityType(
  entityType: string | undefined
): string {
  if (!entityType) {
    return '@';
  }
  if (entityType === 'mention') {
    return '@';
  }
  const suffix = 'mention';
  if (entityType.endsWith(suffix) && entityType.length > suffix.length) {
    return entityType.slice(0, -suffix.length);
  }
  return '@';
}

export const convertJsonToHtml = (json: any) => {
  const { blocks, entityMap } = json;
  let html = "";

  blocks.forEach((block: any) => {
    let blockText = "";
    let lastIndex = 0;

    // Process each entity range
    block.entityRanges.forEach((entityRange: any) => {
      const { offset, length, key } = entityRange;
      const entity = entityMap[key];
      const { name, link } = entity.data.mention;

      // Add text before the mention
      blockText += block.text.substring(lastIndex, offset);

      const mentionSymbol =
        entity.data?.mention?.trigger ??
        triggerFromMentionEntityType(entity?.type);
      const mentionHtml = link
        ? `<a href="${link}" target="_blank" rel="noopener noreferrer"><strong>${mentionSymbol}${name}</strong></a>`
        : `<a href="#" onclick="event.preventDefault();"><strong>${mentionSymbol}${name}</strong></a>`;
      blockText += mentionHtml;

      // Update lastIndex
      lastIndex = offset + length;
    });

    // Add remaining text after the last mention
    blockText += block.text.substring(lastIndex);

    // Wrap block text in paragraph tags
    html += `<p>${blockText}</p>`;
  });

  return html;
};


export default CommentStructure
