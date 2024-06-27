import React from 'react';
import './FullscreenButton.scss';

export default class FullscreenButton extends React.Component {
  /**
   * @class
   * @param {object} props React props.
   */
  constructor(props) {
    super(props);
    this.props = props;
  }

  /**
   * React render function.
   * @returns {object} JSX element.
   */
  render() {
    return (
      <button
        aria-label={ this.props.ariaLabel }
        className='h5p-escape-room-fullscreen-button'
        onClick={ this.props.onClicked }
        tabIndex={ this.props.tabIndex }
      />
    );
  }
}
