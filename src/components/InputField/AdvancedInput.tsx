import React, {
  useState,
  useRef,
  useCallback,
  useEffect,
  useContext,
  useMemo,
} from 'react';
import { EditorState, convertToRaw } from 'draft-js';
import Editor from '@draft-js-plugins/editor';
import createMentionPlugin, { MentionData } from '@draft-js-plugins/mention';
import {
  GlobalContext,
  DEFAULT_MENTION_TRIGGERS,
} from '../../context/Provider';
import { SubMentionComponentProps } from '@draft-js-plugins/mention/lib/Mention';

interface AdvancedInputProps {
  formStyle?: object;
  handleSubmit: (event: React.FormEvent, content: string, editorText: EditorState) => void;
  mode?: string;
  cancelBtnStyle?: object;
  submitBtnStyle?: object;
  comId?: string;
  imgStyle?: object;
  imgDiv?: object;
  customImg?: string;
  text: string;
  editorText?: EditorState;
}

const MentionComponent = (props: SubMentionComponentProps) => {
  const { children, mention } = props;
  const link = mention?.link || '#';

  const handleClick = (e: React.MouseEvent<HTMLAnchorElement, MouseEvent>) => {
    e.preventDefault();
    if (link !== '#') {
      window.open(link, '_blank', 'noopener,noreferrer');
    }
  };

  return (
    <a
      href="#"
      onClick={handleClick}
      style={{ textDecoration: 'underline', color: 'blue', cursor: 'pointer' }}
    >
      {children}
    </a>
  );
};

function defaultMentionPlaceholder(triggers: string[]): string {
  if (triggers.length === 0) {
    return 'Add a comment...';
  }
  const parts = triggers.map((t) => `'${t}'`);
  if (parts.length === 1) {
    return `Add a comment or use ${parts[0]} to mention...`;
  }
  const last = parts.pop()!;
  return `Add a comment or use ${parts.join(', ')} or ${last} to mention...`;
}

const AdvancedInput = ({
  formStyle,
  handleSubmit,
  submitBtnStyle,
  cancelBtnStyle,
  mode,
  comId,
  imgDiv,
  imgStyle,
  customImg,
  editorText
}: AdvancedInputProps) => {
  const globalStore: any = useContext(GlobalContext);
  const mentionTriggers: string[] =
    globalStore.mentionTriggers ?? DEFAULT_MENTION_TRIGGERS;
  const triggersKey = JSON.stringify(mentionTriggers);

  const { plugins, MentionSuggestions } = useMemo(() => {
    const mentionPlugin = createMentionPlugin({
      mentionTrigger: mentionTriggers,
      mentionPrefix: (trigger: string) => trigger,
      supportWhitespace: true,
      mentionComponent: MentionComponent,
    });
    return {
      plugins: [mentionPlugin],
      MentionSuggestions: mentionPlugin.MentionSuggestions,
    };
  }, [triggersKey]);

  const [editorState, setEditorState] = useState(EditorState.createEmpty());
  const [open, setOpen] = useState(false);
  const [suggestions, setSuggestions] = useState<MentionData[]>([]);
  const editorRef = useRef<Editor>(null);
  const lastMentionQueryRef = useRef<{ trigger: string; value: string }>({
    trigger: '',
    value: '',
  });

  useEffect(() => {
    if (editorText && editorText instanceof EditorState) {
      setEditorState(editorText);
    } else {
      setEditorState(EditorState.createEmpty());
    }
  }, [editorText]);

  const onChange = useCallback((newEditorState: EditorState) => {
    setEditorState(newEditorState);
  }, []);

  const onOpenChange = useCallback((_open: boolean) => {
    setOpen(_open);
  }, []);

  const onSearchChange = useCallback(
    async ({ trigger, value }: { trigger: string; value: string }) => {
      lastMentionQueryRef.current = { trigger, value };
      const list = globalStore.mentionSuggestions?.[trigger] ?? [];

      if (globalStore.onMentionSearch) {
        if (value.trim().length === 0) {
          setSuggestions(list);
          return;
        }
        try {
          const results = await globalStore.onMentionSearch(trigger, value);
          setSuggestions(results);
        } catch {
          setSuggestions([]);
        }
        return;
      }

      if (trigger === '#' && globalStore.onHashMentionSearch) {
        if (value.trim().length === 0) {
          setSuggestions(list);
          return;
        }
        try {
          const results = await globalStore.onHashMentionSearch(value);
          setSuggestions(results);
        } catch {
          setSuggestions([]);
        }
        return;
      }

      const filteredSuggestions = list.filter((mention: MentionData) =>
        mention.name.toLowerCase().includes(value.toLowerCase()),
      );
      setSuggestions(filteredSuggestions);
    },
    [globalStore],
  );

  const mentionSuggestions = globalStore.mentionSuggestions;

  useEffect(() => {
    const { trigger, value } = lastMentionQueryRef.current;
    if (value.trim() !== '') {
      return;
    }
    const useAsync =
      globalStore.onMentionSearch ||
      (trigger === '#' && globalStore.onHashMentionSearch);
    if (!useAsync) {
      return;
    }
    setSuggestions(mentionSuggestions?.[trigger] ?? []);
  }, [mentionSuggestions, globalStore.onMentionSearch, globalStore.onHashMentionSearch]);

  const handleSubmitWrapper = async (e: React.FormEvent) => {
    e.preventDefault();
    if (editorState) {
      const contentState = editorState.getCurrentContent();
      const rawContentState = convertToRaw(contentState);
      if (rawContentState) {
        await handleSubmit(e, JSON.stringify(rawContentState), editorState);
        setEditorState(EditorState.createEmpty());
      }
    }
  };

  const placeholder =
    globalStore.advancedInputPlaceholder ??
    (globalStore.isAuthenticated
      ? defaultMentionPlaceholder(mentionTriggers)
      : 'Start typing a comment...');

  return (
    <div className='advanced-overlay'>
      <div className='userImg' style={imgDiv}>
        <a target='_blank' href={globalStore.currentUserData.currentUserProfile}>
          <img
            src={globalStore.customImg || customImg || globalStore.currentUserData.currentUserImg}
            style={globalStore.imgStyle || imgStyle}
            alt='userIcon'
            className='imgdefault'
          />
        </a>
      </div>
      <div className='advanced-input'>
        <form
          className='form advanced-form'
          style={globalStore.formStyle || formStyle}
          onSubmit={handleSubmitWrapper}
        >
          <div
            className="editor"
            onClick={() => {
              editorRef.current?.focus();
            }}
          >
            <Editor
              editorState={editorState}
              onChange={onChange}
              plugins={plugins}
              ref={editorRef}
              placeholder={placeholder}
            />
            <MentionSuggestions
              open={open}
              onOpenChange={onOpenChange}
              onSearchChange={onSearchChange}
              suggestions={suggestions}
            />
          </div>
          <div className='advanced-btns'>
            {mode && (
              <button
                className='advanced-cancel cancelBtn'
                style={globalStore.cancelBtnStyle || cancelBtnStyle}
                type="button"
                onClick={() =>
                  mode === 'editMode'
                    ? globalStore.handleAction(comId, true)
                    : globalStore.handleAction(comId, false)
                }
              >
                Cancel
              </button>
            )}
            <button
              className='advanced-post postBtn'
              type="submit"
              disabled={!editorState || !(editorState instanceof EditorState) || !editorState.getCurrentContent().hasText()}
              style={globalStore.submitBtnStyle || submitBtnStyle}
            >
              Post
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AdvancedInput;
