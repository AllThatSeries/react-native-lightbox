import React, {
  Children,
  cloneElement,
} from 'react';
import {
  Animated,
  TouchableHighlight,
  View,
} from 'react-native';
import PropTypes from 'prop-types';
import LightboxOverlay from './LightboxOverlay';

class Lightbox extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      isOpen: false,
      origin: {
        x: 0,
        y: 0,
        width: 0,
        height: 0,
      },
      layoutOpacity: new Animated.Value(1),
    }
  }

  getContent() {
    if (this.props.renderContent) {
      return this.props.renderContent();
    } else if (this.props.activeProps) {
      return cloneElement(
        Children.only(this.props.children),
        this.props.activeProps
      );
    }
    return this.props.children;
  }

  getOverlayProps() {
    return {
      isOpen: this.state.isOpen,
      origin: this.state.origin,
      renderHeader: this.props.renderHeader,
      swipeToDismiss: this.props.swipeToDismiss,
      springConfig: this.props.springConfig,
      backgroundColor: this.props.backgroundColor,
      children: this.getContent(),
      onClose: this.onClose.bind(this),
    };
  }

  open() {
    this._root.measure((ox, oy, width, height, px, py) => {
      this.props.onOpen();

      this.setState({
        isOpen: false,
        isAnimating: true,
        origin: {
          width,
          height,
          x: px,
          y: py,
        },
      }, () => {
        this.setState({
          isOpen: true,
        });
        setTimeout(() => {
          this.state.layoutOpacity.setValue(0);
        }, 0);
      });
    });
  }

  close() {
    throw new Error('Lightbox.close method is deprecated. Use renderHeader(close) prop instead.')
  }

  onClose() {
    this.state.layoutOpacity.setValue(1);
    this.setState({
      isOpen: false,
    }, this.props.onClose);
  }

  render() {
    // measure will not return anything useful if we dont attach a onLayout handler on android
    return (
      <View
        ref={c => this._root = c}
        style={this.props.style}
        onLayout={() => { }}
      >
        <Animated.View style={{ opacity: this.state.layoutOpacity }}>
          <TouchableHighlight
            underlayColor={this.props.underlayColor}
            onPress={() => this.open()}
          >
            {this.props.children}
          </TouchableHighlight>
        </Animated.View>
        <LightboxOverlay {...this.getOverlayProps() } />
      </View>
    );
  }
}

Lightbox.propTypes = {
  activeProps: PropTypes.object,
  renderHeader: PropTypes.func,
  renderContent: PropTypes.func,
  underlayColor: PropTypes.string,
  backgroundColor: PropTypes.string,
  onOpen: PropTypes.func,
  onClose: PropTypes.func,
  springConfig: PropTypes.shape({
    tension: PropTypes.number,
    friction: PropTypes.number,
  }),
  swipeToDismiss: PropTypes.bool,
};

Lightbox.defaultProps = {
  swipeToDismiss: true,
  onOpen: () => { },
  onClose: () => { },
}

export default Lightbox;

