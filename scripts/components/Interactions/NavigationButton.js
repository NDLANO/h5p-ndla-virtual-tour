import React from 'react';
import './NavigationButton.scss';
import { H5PContext } from '../../context/H5PContext';
import NavigationButtonLabel, { getLabelPos, getLabelText, isHoverLabel } from './NavigationButtonLabel';
import HotspotNavButton from './HotspotNavButton';

export const Icons = {
  INFO: 'h5p-info-button h5p-interaction-button',
  QUESTION: 'h5p-question-button h5p-interaction-button',
  GO_TO_SCENE: 'h5p-go-to-scene-button',
  GO_BACK: 'h5p-go-back-button',
  SCENE_DESCRIPTION: 'h5p-scene-description-button',
  AUDIO: 'h5p-audio-button h5p-interaction-button',
  VIDEO: 'h5p-video-button h5p-interaction-button',
  IMAGE: 'h5p-image-button h5p-interaction-button',
  INFO_MARK: 'h5p-info-mark-button h5p-interaction-button',
  LOCK: 'h5p-locked-button h5p-interaction-button',
  UNLOCK: 'h5p-unlocked-button h5p-interaction-button',
  TEXT_BLOCK: 'h5p-text-block-button h5p-interaction-button',
};

const infoInteractions = [
  'H5P.AdvancedText',
  'H5P.Image',
  'H5P.Video',
  'H5P.Summary',
  'H5P.SingleChoiceSet',
  'H5P.MultiChoice',
  'H5P.Blanks'
];

/**
 * @param {string} machineName
 * @returns {boolean}
 */
const isInfoInteraction = (machineName) => {
  return infoInteractions.includes(machineName);
};

/**
 * @param {Interaction} interaction
 * @param {Array<SceneParams>} scenes
 * @returns {string}
 */
export const getIconFromInteraction = (interaction, scenes) => {
  interaction.hotspotSettings = interaction.hotspotSettings ?? {};

  const library = interaction.action.library;
  const machineName = H5P.libraryFromString(library).machineName;
  let icon = '';
  if (interaction.passwordSettings?.interactionPassword && !interaction.unlocked) {
    icon = Icons.LOCK;
  }
  else if (machineName === 'H5P.GoToScene') {
    icon = Icons.GO_TO_SCENE;

    const nextScene = scenes.find((scene) => {
      return scene.sceneId === interaction.action.params.nextSceneId;
    });
    if (nextScene && nextScene.iconType === 'plus') {
      icon = Icons.INFO;
    }
  }
  else if (machineName === 'H5P.Audio') {
    icon = Icons.AUDIO;
  }
  else if (machineName === 'H5P.AdvancedText') {
    if (interaction.iconTypeTextBox === 'text-icon') {
      icon = Icons.TEXT_BLOCK;
    }
    else {
      icon = Icons.INFO_MARK;
    }
  }
  else if (machineName === 'H5P.Video') {
    icon = Icons.VIDEO;
  }
  else if (machineName === 'H5P.Image') {
    icon = Icons.IMAGE;
  }
  else if (isInfoInteraction(machineName)) {
    icon = Icons.INFO;
  }
  else {
    icon = Icons.QUESTION;
  }
  return icon;
};

/**
 * @param {Interaction} interaction
 * @returns {InteractionLabel}
 */
export const getLabelFromInteraction = (interaction) => {
  return { ...interaction.label, labelText: interaction.labelText };
};


/**
 * @typedef {{
 *  sceneId?: number;
 *  interactionIndex?: number;
 *  isFocused?: boolean;
 *  buttonClasses: Array<string>;
 *  icon: string;
 *  showAsHotspot?: boolean;
 *  isHiddenBehindOverlay: boolean;
 *  title: string;
 *  label?: InteractionLabel;
 *  staticScene?: boolean;
 *  leftPosition?: number;
 *  topPosition?: number;
 *  type?: string;
 *  forceClickHandler?: boolean;
 *  nextFocus?: string;
 *  showHotspotOnHover?: boolean;
 *  isHotspotTabbable?: boolean;
 *  wrapperHeight?: number;
 *  rendered?: boolean;
 *  is3d?: boolean;
 *  children?: React.ReactNode;
 *  clickHandler: () => void;
 *  doubleClickHandler?: () => void;
 *  mouseDownHandler?: (event: MouseEvent) => void;
 *  onFocus?: () => void;
 *  onBlur?: () => void;
 *  onFocusedInteraction?: () => void;
 *  onMount?: (wrapper: HTMLElement) => void;
 *  onUnmount?: (wrapper: HTMLElement) => void;
 *  onUpdate?: (wrapper: HTMLElement) => void;
 * }} Props
 */

/**
 * @typedef {{
 *  isFocused: boolean;
 *  expandButtonFocused: boolean;
 *  innerButtonFocused: boolean;
 *  isMouseOver: boolean;
 * }} State
 */

/**
 * @extends {React.Component<Props, State>}
 */
export default class NavigationButton extends React.Component {
  /**
   * @param {Props} props
   */
  constructor(props) {
    super(props);

    this.navButtonWrapper = React.createRef();
    this.navButton = React.createRef();
    this.expandButton = React.createRef();
    this.onBlur = this.onBlur.bind(this);
    this.onFocus = this.onFocus.bind(this);
    this.resizeOnDrag = this.resizeOnDrag.bind(this);

    /** @type {State} */
    this.state = {
      isFocused: this.props.isFocused,
      expandButtonFocused: false,
      innerButtonFocused: false,
      isMouseOver: false,
    };
  }

  resizeOnDrag = (width, height) => {
    this.setHotspotValues(width, height);

    if (this.context.extras.isEditor) {
      this.forceUpdate();
    }
  };

  addFocusListener() {
    if (this.navButtonWrapper) {
      this.navButtonWrapper.current.addEventListener('focus', this.onFocus);
    }
  }

  onFocus() {
    // Already focused
    if (this.state.isFocused) {
      return;
    }

    this.setState({
      isFocused: true,
    });

    if (this.props.onFocusedInteraction) {
      this.props.onFocusedInteraction();
    }
  }

  /**
   * @param {FocusEvent} event
   */
  onBlur(event) {
    const navButtonWrapper = this.navButtonWrapper
      && this.navButtonWrapper.current;

    if (navButtonWrapper && navButtonWrapper.contains(event.relatedTarget) && (!this.expandButton || event.relatedTarget !== this.expandButton.current)) {
      // Clicked target is child of button wrapper and not the expandButton, don't blur
      this.setFocus();
      return;
    }

    this.setState({
      isFocused: false,
    });
    if (this.props.onBlur) {
      this.props.onBlur();
    }
  }

  componentDidMount() {
    if (this.props.onMount) {
      // Let parent know this element should be added to the THREE world.
      this.props.onMount(this.navButtonWrapper.current);
    }

    this.addFocusListener();
    if (this.state.isFocused) {
      setTimeout(() => {
        this.setFocus();
      }, 0);
    }
  }

  /**
   * @param {Props} prevProps
   */
  componentDidUpdate(prevProps) {
    if (this.props.type && this.props.type === this.props.nextFocus && prevProps.nextFocus !== this.props.nextFocus) {
      this.skipFocus = true; // Prevent moving camera on next focus (makes for a better UX when using the mouse)
      this.setFocus();
    }

    if (this.props.isFocused && !prevProps.isFocused && this.context.threeSixty) {
      setTimeout(() => { // Note: Don't think the timeout is needed after rendering was fixed
        this.context.threeSixty.preventCameraMovement = true;
        this.setFocus(true);
      }, 0);
    }

    if (this.props.onUpdate) {
      // Let parent know this element is updated. (Position might have changed.)
      this.props.onUpdate(this.navButtonWrapper.current);
    }

    if (prevProps.isFocused !== this.props.isFocused) {
      if (!this.props.isFocused) {
        this.setState({
          isFocused: false,
        });
      }
    }
  }

  componentWillUnmount() {
    if (this.navButtonWrapper) {
      this.navButtonWrapper.current.removeEventListener('focus', this.onFocus);
    }

    if (this.props.onUnmount) {
      const el = this.navButtonWrapper.current;
      // We want this to run after the component is removed
      setTimeout(() => {
        // Let parent know this element should be remove from the THREE world.
        this.props.onUnmount(el);
      }, 0);
    }
  }

  getStyle(width, height) {
    const style = {};
    if (this.props.topPosition !== undefined) {
      style.top = `${this.props.topPosition}%`;
    }
    if (this.props.leftPosition !== undefined) {
      style.left = `${this.props.leftPosition}%`;
    }
    if (this.props.staticScene) {
      // set width and height for static scene
      style.width = `${width}%`;
      style.height = `${height}%`;
    }
    else {
      // set width and height for 360 scene
      style.width = width;
      style.height = height;
    }
    return style;
  }

  onClick() {
    const hasClickHandler = this.props.forceClickHandler
      || !this.context.extras.isEditor;

    if (hasClickHandler) {
      this.props.clickHandler();

      // Reset button focus state when changing scenes or opening content
      this.setState({
        innerButtonFocused: false
      });
    }

    this.setFocus(true);
  }

  onDoubleClick() {
    if (this.props.doubleClickHandler) {
      this.props.doubleClickHandler();
    }
    this.setState({
      isFocused: false,
    });
  }

  onMouseDown(e) {
    const hasMouseDownHandler = this.context.extras.isEditor
      && this.props.mouseDownHandler;
    if (hasMouseDownHandler) {
      this.props.mouseDownHandler(e);
    }
  }

  /**
   * Set focus to relevant button element.
   *
   * @param {boolean} preventCameraMovement If true, don't move camera on focus.
   */
  setFocus(preventCameraMovement = false) {
    if (preventCameraMovement) {
      this.context.threeSixty?.setPreventCameraMovement(true);
    }

    /*
     * In editor, wrapper needs to get focus, or DragNBar context menu is not
     * available when selecting button. In the view, button needs to get focus
     * or after closing modal the scene will lose focus.
     */
    const focusElement = this.context.extras.isEditor ?
      this.navButtonWrapper?.current :
      this.navButton?.current;

    focusElement?.focus({ preventScroll: true });
  }

  /**
   * @param {React.FocusEvent<HTMLElement>} event
   */
  handleFocus = (event) => {
    if (this.context.extras.isEditor) {
      if (this.navButtonWrapper?.current === event.target) {
        this.setFocus();
      }
      return;
    }

    if (!this.context.extras.isEditor  && this.props.onFocus) {
      if (this.skipFocus) {
        this.skipFocus = false;
      }
      else {
        this.props.onFocus();
      }
    }
  };

  /**
   * Handle changing scenes
   */
  handleGoToScene = () => {
    // Make sure focus is dropped when changing scenes (Edge)
    this.setState({
      isFocused: false,
    });
  };

  handleExpandButtonFocus = () => {
    this.setState({
      expandButtonFocused: true
    });
    if (this.props.onFocusedInteraction) {
      this.props.onFocus();
    }
  };

  /**
   * @param {number} widthX
   * @param {number} heightY
   */
  setHotspotValues(widthX, heightY) {
    const scene = this.context.params.scenes.find(
      (/** @type {SceneParams} */ scene) => scene.sceneId === this.props.sceneId,
    );
    const interaction = scene.interactions[this.props.interactionIndex];
    interaction.hotspotSettings.hotSpotSizeValues = `${widthX},${heightY}`;
  }

  getHotspotValues() {
    const interaction = this.getCurrentInteraction();

    return interaction.hotspotSettings.hotSpotSizeValues ?
      interaction.hotspotSettings.hotSpotSizeValues.split(',') :
      [NavigationButton.DEFAULT_WIDTH_3D, NavigationButton.DEFAULT_HEIGHT_3D];
  }

  /**
   * @private
   *
   * Returns the current Interaction,
   * based on current scene id and current interaction id.
   *
   * @returns {Interaction}
   */
  getCurrentInteraction() {
    const scene = this.context.params.scenes.find((/** @type {SceneParams} */ scene) => {
      return scene.sceneId === this.props.sceneId;
    });
    return scene?.interactions ? scene.interactions[this.props.interactionIndex] : null;
  }

  render() {
    const interaction = this.getCurrentInteraction();
    const [libraryName] = interaction ?
      (H5P.libraryFromString(interaction?.action?.library).machineName || '')
        .split('.') :
      [null];

    let wrapperClasses = interaction ? [
      'nav-button-wrapper',
      `nav-button-wrapper--${libraryName.toLowerCase()}`,
    ] : ['nav-button-wrapper'];


    if (this.props.buttonClasses) {
      wrapperClasses = wrapperClasses.concat(this.props.buttonClasses);
    }

    if (this.props.icon) {
      wrapperClasses.push(this.props.icon);
    }

    if (interaction?.isAnswered) {
      wrapperClasses.push('h5p-interaction-answered');
    }

    if (this.props.is3d) {
      wrapperClasses = wrapperClasses.concat('nav-btn-hotspot render-in-3d');
    }

    if (this.state.isMouseOver) {
      wrapperClasses.push('hover');
    }

    // only apply custom focus if we have children that are shown on focus
    if (this.state.isFocused && this.props.children) {
      wrapperClasses.push('focused');
    }

    // Add classname to current active element (wrapper, button or expand label button) so it can be shown on top
    if (this.state.isFocused && this.props.children
      || this.state.expandButtonFocused
      || this.state.innerButtonFocused) {
      wrapperClasses.push('active-element');
    }

    const isWrapperTabbable = this.context.extras.isEditor;
    const isInnerButtonTabbable = !this.context.extras.isEditor
      && !this.props.isHiddenBehindOverlay;

    if (this.props.title) {
      const titleText = document.createElement('div');
      titleText.innerHTML = this.props.title;
    }

    let label = this.props.label ? this.props.label : {
      labelPosition: 'inherit',
      showLabel: 'inherit'
    };

    let labelPos = getLabelPos(this.context.behavior.label, label);
    let hoverLabel = isHoverLabel(this.context.behavior.label, label);

    const labelText = getLabelText(label);

    let width;
    let height;

    // TODO: What is this used for? Change of scene type? Already covered in editor now, isn't it?
    if (this.props.label && this.props.staticScene && this.props.showAsHotspot) {
      width = parseFloat(this.getHotspotValues()[0].toString());
      height = parseFloat(this.getHotspotValues()[1].toString());

      // Change default size if static scene
      if (
        width === NavigationButton.DEFAULT_WIDTH_3D &&
        height === NavigationButton.DEFAULT_HEIGHT_3D
      ) {
        width = NavigationButton.DEFAULT_WIDTH_2D;
        height = NavigationButton.DEFAULT_HEIGHT_2D;
        this.setHotspotValues(width, height);
      }
    }

    return (
      <div
        ref={this.navButtonWrapper}
        className={wrapperClasses.join(' ')}
        style={this.getStyle(width, height)}
        tabIndex={isWrapperTabbable ? 0 : undefined}
        onFocus={this.handleFocus}
        onClick={this.onClick.bind(this)}
        onBlur={this.onBlur.bind(this)}
      >
        {
          this.props.showAsHotspot ?
            <HotspotNavButton
              reference={this.navButton}
              style={{ height:'100%', width:'100%' }}
              ariaLabel={getLabelText(label)}
              tabIndexValue={isInnerButtonTabbable ? undefined : -1}
              onClickEvent={this.onClick.bind(this)}
              onDoubleClickEvent={this.onDoubleClick.bind(this)}
              onMouseDownEvent={this.onMouseDown.bind(this)}
              onFocusEvent={() => this.setState({ innerButtonFocused: true })}
              onBlurEvent={() => this.setState({ innerButtonFocused: false })}
              resizeOnDrag={this.resizeOnDrag}
              setHotspotValues={this.setHotspotValues.bind(this)}
              getHotspotValues={this.getHotspotValues.bind(this)}
              staticScene={this.props.staticScene}
              showHotspotOnHover={this.props.showHotspotOnHover}
              isHotspotTabbable={this.props.isHotspotTabbable}
            />
            :
            <button
              ref={this.navButton}
              aria-label={getLabelText(label)}
              className='nav-button'
              tabIndex={isInnerButtonTabbable ? undefined : -1}
              onClick={this.onClick.bind(this)}
              onDoubleClick={this.onDoubleClick.bind(this)}
              onMouseDown={this.onMouseDown.bind(this)}
              onFocus={() => this.setState({ innerButtonFocused: true })}
              onBlur={() => this.setState({ innerButtonFocused: false })}/>
        }
        {this.props.children}
        {
          this.props.icon !== 'h5p-go-back-button' && labelText !== '' && !this.props.showAsHotspot &&
          <NavigationButtonLabel
            labelText={labelText}
            labelPos={labelPos}
            hoverOnly={hoverLabel}
            onMount={this.props.onMount}
            forwardRef={this.expandButton}
            onFocus={this.handleExpandButtonFocus.bind(this)}
            onBlur={() => this.setState({ expandButtonFocused: false })}
            topPosition={this.props.topPosition * this.props.wrapperHeight / 100}
            wrapperHeight={this.props.wrapperHeight}
            leftPosition={this.props.leftPosition}
            navButtonHeight={this.navButton.current ? this.navButton.current.offsetHeight : null}
            staticScene={this.props.staticScene}
            navButtonFocused={this.state.innerButtonFocused}
            rendered={this.props.rendered}
            onDoubleClick={this.onDoubleClick.bind(this)}
          />}

      </div>
    );
  }
}
NavigationButton.contextType = H5PContext;

/** @constant {number} DEFAULT_WIDTH_2D Default button width in 2d content. */
NavigationButton.DEFAULT_WIDTH_2D = 25;

/** @constant {number} DEFAULT_HEIGHT_2D Default button height in 2d content. */
NavigationButton.DEFAULT_HEIGHT_2D = 25;

/** @constant {number} DEFAULT_WIDTH_3D Default button width in 3d content. */
NavigationButton.DEFAULT_WIDTH_3D = 256;

/** @constant {number} DEFAULT_HEIGHT_3D Default button height in 3d content. */
NavigationButton.DEFAULT_HEIGHT_3D = 128;

export const DEFAULT_WIDTH_2D = NavigationButton.DEFAULT_WIDTH_2D;
export const DEFAULT_HEIGHT_2D = NavigationButton.DEFAULT_HEIGHT_2D;
export const DEFAULT_WIDTH_3D = NavigationButton.DEFAULT_WIDTH_3D;
export const DEFAULT_HEIGHT_3D = NavigationButton.DEFAULT_HEIGHT_3D;
