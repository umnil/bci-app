import { 
    StyleSheet,
    View, 
    Text, 
    ScrollView,
    Dimensions 
} from 'react-native';
import { GestureDetector, Gesture } from 'react-native-gesture-handler';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from 'react-native-reanimated';
import PropTypes from 'prop-types';
import { useState } from 'react';

export default function DragDropItemList(props) {
   kDrop = useSharedValue(0);
   zIncr = useSharedValue(1);
   return(
    <ScrollView style={{width:100, height:200}}>
        {props.data.map(item => {return (
<DragDropItem item={item} key={item.label} renderItem={props.renderItem} kDrop={kDrop} zIncr={zIncr}
    />);})}
    </ScrollView>
    );
}

function DragDropItem(props) {
    const isPressed = useSharedValue(false);
    const offset = useSharedValue({x: 0, y: 0});
    const touchStart = useSharedValue({x: 0, y: 0, time: 0});
    const animatedStyles = useAnimatedStyle(() => {
        return {
          transform: [
            { translateX: offset.value.x },
            { translateY: offset.value.y },
            { scale: withSpring(isPressed.value ? 1.2 : 1) },
          ],
          backgroundColor: isPressed.value ? 'yellow' : 'red',
          zIndex: isPressed.value ? (zIncr.value+2) : (props.kDrop.value == props.item.key ? (zIncr.value+1) : (zIncr.value)),
        };
    });
    const TOUCH_SLOP = 4;
    const TIME_TO_ACTIVATE_PAN = 250;
 
    const gesture = Gesture.Pan()
        .manualActivation(true)
        .onTouchesDown((e) => {
      touchStart.value = {
        x: e.changedTouches[0].x,
        y: e.changedTouches[0].y,
        time: Date.now(),
      };
    })
    .onTouchesMove((e, state) => {
      if (Date.now() - touchStart.value.time > TIME_TO_ACTIVATE_PAN) {
        state.activate();
      } else if (
        Math.abs(touchStart.value.x - e.changedTouches[0].x) > TOUCH_SLOP ||
        Math.abs(touchStart.value.y - e.changedTouches[0].y) > TOUCH_SLOP
      ) {
        state.fail();
      }
    })
        .onBegin((e) => {
            'worklet';
            isPressed.value = true;
        })
        .onChange((e) => {
            'worklet';
            offset.value = {
                x: e.changeX + offset.value.x,
                y: e.changeY + offset.value.y
            };
        })
        .onFinalize((e) => {
            'worklet';
            isPressed.value = false;
            zIncr.value += 1;
            kDrop.value = props.item.key;
        })
  
    return (
        <GestureDetector gesture={gesture}>
                <Animated.View
                style={animatedStyles}
                key={props.item.key}>
                    {props.renderItem(props.item)}
            </Animated.View>
        </GestureDetector>
);
}    




