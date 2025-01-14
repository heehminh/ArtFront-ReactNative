import { View, TouchableOpacity, Dimensions, Image, ActivityIndicator } from 'react-native'
import React, { useEffect, useState } from 'react'
import Video from 'react-native-video';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { heightSelector, uriSelector, widthSelector } from '../../recoil/selector';
import { useRecoilValue } from 'recoil';
import GoBack from '../../components/Common/GoBack';
import theme from '../../../theme';
import AntDesign from 'react-native-vector-icons/AntDesign'
import { getStatusBarHeight } from 'rn-statusbar-height';
import NextPage from '../../components/Common/NextPage';
import VideoShare from '../../components/Main/Video/VideoShare';
import { useQuery } from 'react-query';
import { getContentVideo } from '../../api/contents';
import AppText from '../../components/Common/Text/AppText';
import RNFS from 'react-native-fs';

const Image2VideoScreen = () => {
  const { data, isLoading, isError, isSuccess } = useQuery('contentVideo', getContentVideo);
  const [video, setVideo] = useState('');
  const [onPress, setOnPress] = useState(false);

  const uri = useRecoilValue(uriSelector);
  const originalWidth = useRecoilValue(widthSelector);
  const originalHeight = useRecoilValue(heightSelector);

  const screenWidth = Dimensions.get('window').width;
  const resizeHeight = (screenWidth*originalHeight) / originalWidth;
  const [load, setLoad] = useState(false);

  const top = getStatusBarHeight();

  const filePath = `${RNFS.DocumentDirectoryPath}/video.mp4`;
  RNFS.writeFile(filePath, video, 'base64');

  useEffect(()=>{
    const convertVideo = async () => {
      if (data && data.data) {
        await RNFS.writeFile(filePath, data.data.video_content, 'base64');
        setVideo(data.data.video_content);
      }
    };
    convertVideo();
  }, [data]);

  useEffect(() => {
    if (isSuccess) {
      const timer = setTimeout(() => {
        setLoad(true);
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [isSuccess]);

  
  if (isLoading || !load) {
    return (
      <View style={{backgroundColor: theme.backgroundWhite, display: 'flex', justifyContent: 'center', alignItems: 'center', width: '100%', height: '100%'}}>
        <ActivityIndicator size="large" />
      </View>
    )
  }

  if (isError) {
    return <AppText>Error</AppText>
  } 

  if (isSuccess && load) {
    return (
      <View style={{backgroundColor: theme.backgroundWhite}}>
  
        <View style={{
            position: 'relative', width: '100%', height: '100%', backgroundColor: theme.backgroundWhite
          }}>
          { onPress ? (
            <>
              <TouchableOpacity 
                  style={{ zIndex:1, position: 'absolute', top: top+10, left :15, }} 
                  onPress={()=>setOnPress(false)}
              >
                <AntDesign name="arrowleft" size={30} color={theme.cocoa} />
              </TouchableOpacity>
              <View style={{width: '100%', height: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center'}}>
                <Video 
                  source={{uri: filePath}}
                  style={{
                      width: screenWidth,
                      height: resizeHeight,
                  }}
                  resizeMode={'stretch'}
                  repeat={true}
                  controls={true} 
                  paused={false}
                  onEnd={()=>setOnPress(false)}
                  />
              </View>
              <NextPage nextPage='ReviewScreen' />
            </>
          ): (
            <>
              <GoBack cocoa/>
              <View style={{ width: '100%', height: '100%', backgroundColor: theme.backgroundWhite, display: 'flex', justifyContent: 'center', alignItems: 'center'  }}>
                <Image source={{ uri: uri }} style={{ width: screenWidth, height: resizeHeight, opacity: 0.3, display:'flex', justifyContent: 'center', alignItems: 'center'}} />
                <TouchableOpacity
                  onPress={() => setOnPress(true)}
                  style={{position: 'absolute' }}
                >
                  <MaterialCommunityIcons name="movie-open-play" color={theme.cocoa} size={80} />
                </TouchableOpacity>
                <VideoShare filePath={filePath} />
              </View>
              <NextPage nextPage='ReviewScreen' />
            </>
        )}
        </View>
      </View>
    )
  }
}

export default Image2VideoScreen