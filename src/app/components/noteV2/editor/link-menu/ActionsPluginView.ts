import { isNodeSelection, posToDOMRect } from '@tiptap/core';
import type { Editor } from '@tiptap/react';
import { EditorState, PluginKey } from '@tiptap/pm/state';
import { EditorView } from '@tiptap/pm/view';
import tippy, { Instance, Props, roundArrow } from 'tippy.js';
import 'tippy.js/themes/light.css';
import 'tippy.js/dist/border.css';
import 'tippy.js/dist/svg-arrow.css';

export interface ActionsPluginProps {
  pluginKey: PluginKey | string;
  editor: Editor;
  element: HTMLElement;
  tippyOptions?: Partial<Props>;
  updateDelay?: number;
  shouldShow?:
    | ((props: {
        editor: Editor;
        view: EditorView;
        state: EditorState;
        oldState?: EditorState;
        from: number;
        to: number;
      }) => boolean)
    | null;
}

type ActionsViewProps = ActionsPluginProps & {
  view: EditorView;
};

// Cloned the BubbleMenuPlugin from tiptap and modified it
// to work as action menus. This opens a tippy popup on the element.
export class ActionsView {
  public editor: Editor;
  public element: HTMLElement;
  public view: EditorView;
  public preventHide = false;
  public tippy: Instance | undefined;
  public tippyOptions?: Partial<Props>;
  public updateDelay: number;
  private updateDebounceTimer: number | undefined;
  public shouldShow: Exclude<ActionsPluginProps['shouldShow'], null>;

  constructor({
    editor,
    element,
    view,
    tippyOptions = {},
    updateDelay = 250,
    shouldShow,
  }: ActionsViewProps) {
    this.editor = editor;
    this.element = element;
    this.view = view;
    this.updateDelay = updateDelay;

    if (shouldShow) {
      this.shouldShow = shouldShow;
    }

    this.element.addEventListener('mousedown', this.mousedownHandler, {
      capture: true,
    });
    this.view.dom.addEventListener('dragstart', this.dragstartHandler);
    this.editor.on('focus', this.focusHandler);
    this.editor.on('blur', this.blurHandler);
    this.tippyOptions = tippyOptions;
    // Detaches menu content from its current parent
    this.element.remove();
    this.element.style.visibility = 'visible';
  }

  mousedownHandler = () => {
    this.preventHide = true;
  };

  dragstartHandler = () => {
    this.hide();
  };

  focusHandler = () => {
    // we use `setTimeout` to make sure `selection` is already updated
    setTimeout(() => this.update(this.editor.view));
  };

  blurHandler = ({ event }: { event: FocusEvent }) => {
    if (this.preventHide) {
      this.preventHide = false;

      return;
    }

    if (
      event?.relatedTarget &&
      this.element.parentNode?.contains(event.relatedTarget as Node)
    ) {
      return;
    }

    this.hide();
  };

  tippyBlurHandler = (event: FocusEvent) => {
    this.blurHandler({ event });
  };

  createTooltip() {
    const { element: editorElement } = this.editor.options;
    const editorIsAttached = !!editorElement.parentElement;

    if (this.tippy || !editorIsAttached) {
      return;
    }

    this.tippy = tippy(editorElement, {
      duration: 0,
      getReferenceClientRect: null,
      content: this.element,
      interactive: true,
      trigger: 'manual',
      placement: 'top',
      hideOnClick: 'toggle',
      arrow: roundArrow,
      theme: 'light',
      ...this.tippyOptions,
    });

    // maybe we have to hide tippy on its own blur event as well
    if (this.tippy.popper.firstChild) {
      (this.tippy.popper.firstChild as HTMLElement).addEventListener(
        'blur',
        this.tippyBlurHandler
      );
    }
  }

  update(view: EditorView, oldState?: EditorState) {
    const { state } = view;
    const hasValidSelection =
      state.selection.$from.pos !== state.selection.$to.pos;

    if (this.updateDelay > 0 && hasValidSelection) {
      this.handleDebouncedUpdate(view, oldState);
      return;
    }

    const selectionChanged = !oldState?.selection.eq(view.state.selection);
    const docChanged = !oldState?.doc.eq(view.state.doc);

    this.updateHandler(view, selectionChanged, docChanged, oldState);
  }

  handleDebouncedUpdate = (view: EditorView, oldState?: EditorState) => {
    const selectionChanged = !oldState?.selection.eq(view.state.selection);
    const docChanged = !oldState?.doc.eq(view.state.doc);

    if (!selectionChanged && !docChanged) {
      return;
    }

    if (this.updateDebounceTimer) {
      clearTimeout(this.updateDebounceTimer);
    }

    this.updateDebounceTimer = window.setTimeout(() => {
      this.updateHandler(view, selectionChanged, docChanged, oldState);
    }, this.updateDelay);
  };

  updateHandler = (
    view: EditorView,
    selectionChanged: boolean,
    docChanged: boolean,
    oldState?: EditorState
  ) => {
    const { state, composing } = view;
    const { selection } = state;

    const isSame = !selectionChanged && !docChanged;

    if (composing || isSame) {
      return;
    }

    this.createTooltip();

    // support for CellSelections
    const { ranges } = selection;
    const from = Math.min(...ranges.map((range) => range.$from.pos));
    const to = Math.max(...ranges.map((range) => range.$to.pos));

    const shouldShow = this.shouldShow?.({
      editor: this.editor,
      view,
      state,
      oldState,
      from,
      to,
    });

    if (!shouldShow) {
      this.hide();

      return;
    }

    this.tippy?.setProps({
      getReferenceClientRect:
        this.tippyOptions?.getReferenceClientRect ||
        (() => {
          if (isNodeSelection(state.selection)) {
            let node = view.nodeDOM(from) as HTMLElement;

            const nodeViewWrapper = node.dataset.nodeViewWrapper
              ? node
              : node.querySelector('[data-node-view-wrapper]');

            if (nodeViewWrapper) {
              node = nodeViewWrapper.firstChild as HTMLElement;
            }

            if (node) {
              return node.getBoundingClientRect();
            }
          }

          return posToDOMRect(view, from, to);
        }),
    });

    this.show();
  };

  show() {
    this.tippy?.show();
  }

  hide() {
    this.tippy?.hide();
  }

  destroy() {
    if (this.tippy?.popper.firstChild) {
      (this.tippy.popper.firstChild as HTMLElement).removeEventListener(
        'blur',
        this.tippyBlurHandler
      );
    }
    this.tippy?.destroy();
    this.element.removeEventListener('mousedown', this.mousedownHandler, {
      capture: true,
    });
    this.view.dom.removeEventListener('dragstart', this.dragstartHandler);
    this.editor.off('focus', this.focusHandler);
    this.editor.off('blur', this.blurHandler);
  }
}
