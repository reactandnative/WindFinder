'use strict';

import  React, {Component} from 'react';
import {
    AppRegistry,
    StyleSheet,
    Text,
    View,
    ListView,
    TextInput,
    TouchableHighlight,
    TouchableOpacity,
    DeviceEventEmitter,
    ToastAndroid,
    WebView,
    Modal,
    Image,
    Dimensions } from 'react-native';


import SurfWeatherList from './SurfWeatherList';
import Ionicons        from 'react-native-vector-icons/Ionicons';
import Carousel        from 'react-native-carousel';

import {
    GoogleAnalyticsTracker,
    GoogleTagManager,
    GoogleAnalyticsSettings
} from 'react-native-google-analytics-bridge';

var tracker1 = new GoogleAnalyticsTracker('UA-87305241-1');


var pickerStyle   = require('./pickerStyle') ;
var surfLocalData = require('./jsData/SurfLocalData.json');
var selectedRowData ;

var webCamView, webCamViewIndicator ;


class LocalList extends Component{


    setCamVisible(visible) {

        this.setState({camVisible: visible});
        // console.log("changed !!!!!!! this.state.camVisible :" + this.state.camVisible + " camUri  : " + camUri);
        // off camLOadedOpa
        this.setState({camLoadedOpa:0 });

    }

    setCamLoadedOK(visible) {
        if(visible == '1'){
            this.setState({camLoadedOpa:1 });
        }

        //console.log("ccamLoadedOpa: visible OK OK :" + this.state.camLoadedOpa);
    }

    setModalVisible(visible) {
        this.setState({modalVisible: visible});
        //console.log("changed !!! this.state.modalVisible :" + this.state.modalVisible);
    }

    setRgba(alpha) {
        var myAlpha = alpha;
        return `"rgba(156,0,16,` + `${myAlpha})"`;
    }

    setRgba_shop(alpha) {
        var myAlpha = alpha;
        return `"rgba(156,0,16,` + `${myAlpha})"`;
    }


    _onPressButton(rowData){
        //ToastAndroid.show('This is '+ rowData.lastName, ToastAndroid.SHORT);
        selectedRowData = rowData;
        this.setModalVisible(true);
    }



    _onPressWebcam(webcam) {

        for(var i in webcam){
            //  console.log("::::::::::::::::::::: i : " + webcam[i]);
        }

        switch (i) {
            case '0':
                webCamView = (
                    <View key="view1" style={{flex:1}}>
                        <WebView
                            modalVisible={this.setCamVisible}
                            onLoad={()=>{this.setCamLoadedOK("1")}}
                            style={styles.webView}
                            automaticallyAdjustContentInsets={true}
                            source={{uri: webcam[0]}}
                            javaScriptEnabled={true}
                            startInLoadingState={true}
                            scalesPageToFit={true}
                        />
                    </View>
                );

                webCamViewIndicator = (
                    <Text style={{fontSize:50, color:"#94000F", textAlign:'center'}}>•</Text>
                );
                break;
            case '1':
                webCamView = (
                    <Carousel animate={false} indicatorColor="#94000F" indicatorOffset={-68}>
                        <View key="view1" style={{flex:1}}>
                            <WebView
                                modalVisible={this.setCamVisible}
                                onLoad={()=>{this.setCamLoadedOK("1")}}
                                style={styles.webView}
                                automaticallyAdjustContentInsets={true}
                                source={{uri: webcam[0]}}
                                javaScriptEnabled={true}
                                startInLoadingState={true}
                                scalesPageToFit={true}
                            />
                        </View>
                        <View key="view2" style={{flex:1}}>
                            <WebView
                                modalVisible={this.setCamVisible}
                                onLoad={()=>{this.setCamLoadedOK("1")}}
                                style={styles.webView}
                                automaticallyAdjustContentInsets={true}
                                source={{uri: webcam[1]}}
                                javaScriptEnabled={true}
                                startInLoadingState={true}
                                scalesPageToFit={true}
                            />
                        </View>
                    </Carousel>
                );

                webCamViewIndicator = null;
                break;
            default: break;
        };

        this.setCamVisible(true);
        // console.log("webcamClicked cam is : " + webcamClicked , " state :" + this.state.camVisible + " camUri : " + camUri);
    }

    constructor(prop){
        super(prop);

        //---------------- Binding to Custom Func ----------------
        this.setModalVisible = this.setModalVisible.bind(this);
        this.setCamVisible = this.setCamVisible.bind(this);
        this.renderRow = this.renderRow.bind(this);
        this.setCamLoadedOK = this.setCamLoadedOK.bind(this)
        //---------------------------------------------------------

        this.ds = new ListView.DataSource({
            sectionHeaderHasChanged: (r1, r2) => r1 !== r2,
            rowHasChanged: (r1, r2) => r1 !== r2
        });

        var {data, sectionIds} = this.renderListViewData(surfLocalData);
        this.state = {
            dataSource          : this.ds.cloneWithRowsAndSections(data, sectionIds)
            ,modalVisible        : false
            ,camVisible          : false
            ,camLoadedOpa         : 0

        };
    }


    componentWillMount() // before rendering
    {
        tracker1.trackScreenView('서핑');
        tracker1.trackEvent('지역리스트뷰', '서핑스팟 목록');

        // The GoogleAnalyticsSettings is static, and settings are applied across all trackers:
        GoogleAnalyticsSettings.setDispatchInterval(30);
        GoogleAnalyticsSettings.setDryRun(true);

        // GoogleTagManager is also static, and works only with one container. All functions here are Promises:
        /*  GoogleTagManager.openContainerWithId("활공장")
         .then(() => {
         return GoogleTagManager.stringForKey("pack");
         })
         .then((pack) => {
         console.log("Pack: ", pack);
         })
         .catch((err) => {
         console.log(err);
         });*/
    }


    renderListViewData(surfLocalData) {

        var data = {}  ;      // Object
        var sectionIds = [];  // Array

        //if(서핑테마 일 경우)
        surfLocalData = surfLocalData.local;

        var province = null;

        for(var i=0; i< surfLocalData.length ; i++){

            if(province != surfLocalData[i].province){
                sectionIds.push(surfLocalData[i].province);
                data[surfLocalData[i].province]=[];
                province = surfLocalData[i].province;
            }

            data[surfLocalData[i].province].push(surfLocalData[i]);
        }

        return {data, sectionIds};
    }

    renderSectionHeader(data, sectionId) {

        return (
            <View style={styles.sectionHeader}>
                <Text style={styles.sectionHeaderText}>{sectionId}</Text>
            </View>
        );
    }



    renderRow(rowData) {


        var webcamVar = [], providerVar = [], webcamShow = false, shopShow = false, webcamShowJudge;

        if(typeof rowData.webcam == "undefined"){
            webcamShow = false;
        } else {
            for(var i in rowData.webcam){
                webcamVar[i] = rowData.webcam[i]["camUrl"];
                providerVar[i] = rowData.webcam[i]["provider"];

            }
            //  console.log("webcam data ezxists: " + webcamVar[i] + ", " + providerVar[i] + ", " + i);

            webcamShow = true;
        }

        if (webcamShow == true) {
            webcamShowJudge = (
                <TouchableOpacity onPress={()=>{if(webcamShow==true){this._onPressWebcam(webcamVar)}}}>
                    <View style={[pickerStyle.iconBorder, {opacity:webcamShow==false?0:1}]}>
                        <Ionicons name="ios-videocam" style={{color:webcamShow==false?this.setRgba(0):this.setRgba(1), fontSize:25}}/>
                    </View>
                </TouchableOpacity>
            );
        } else {
            //space-around을 쓰기땜에 shop 아이콘 부분과 동일한 간격 띄워둠
            webcamShowJudge = (<Text>        </Text>);
        }


        if( typeof rowData.shop == "undefined"){
            shopShow = false;
        } else {
            shopShow = true;
        }

        return (
            <TouchableOpacity onPress={() => { this._onPressButton(rowData)}}>
                {/* row style */}
                <View style={pickerStyle.listViewrow}>
                    {/* distict */}
                    <View style={pickerStyle.listViewrowDistrict}>
                        <Text style={styles.text}>{rowData.district}</Text>
                    </View>

                    {/* icons */}
                    <View style={pickerStyle.listViewrowCam}>
                        {/* cam icon showing control */}
                        {webcamShowJudge}

                        {/* shop icon showing control */}
                        <TouchableOpacity onPress = {() => this.props.setShopModalVisible(true, rowData.shop)}>
                            <View style={[pickerStyle.iconBorder, {opacity:shopShow==false?0:1}]}>
                                <Image source={require('./image/surfShop.png')}
                                       style={{opacity:shopShow==false?0:1, width:24, height:24}}/>
                            </View>
                        </TouchableOpacity>

                    </View>
                </View>
            </TouchableOpacity>
        )
    }

    render() {
        return (
            <View>
                <Modal
                    animationType={"fade"}
                    transparent={false}
                    visible={this.state.modalVisible}
                    onRequestClose={() => {this.setModalVisible(false)}}>

                    <SurfWeatherList
                        modalVisible={this.setModalVisible}
                        rowData = {selectedRowData}/>
                </Modal>
                <ListView
                    ref="listView"
                    automaticallyAdjustContentInsets={false}
                    dataSource={this.state.dataSource}
                    renderSectionHeader={this.renderSectionHeader}
                    renderRow={this.renderRow}
                />

                <Modal
                    animationType={"fade"}
                    transparent={true}
                    visible={this.state.camVisible}
                    onRequestClose={() => {this.setCamVisible(false)}}>
                    <View style={styles.modalContainer}>
                        <View style={[styles.closeIcon, {opacity:this.state.camLoadedOpa}]}>
                            <TouchableOpacity onPress={()=>{this.setCamVisible(false)}}>
                                <Ionicons name="md-close" size={35} color={'white'}/>
                            </TouchableOpacity>
                        </View>
                        <View style={{height:SCREEN_HEIGHT/2}}>
                            {webCamView}
                        </View>
                        <View style={styles.circleIcon}>{webCamViewIndicator}</View>
                    </View>
                </Modal>
            </View>
        );
    }
};


const SCREEN_WIDTH = Dimensions.get('window').width;
const SCREEN_HEIGHT = Dimensions.get('window').height;

var styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        backgroundColor: '#F5FCFF',
    },
    circleIcon : {
        width : SCREEN_WIDTH,
        alignItems : 'center',
        position:'absolute'
    },
    text: {
        fontSize: 15,
        fontWeight: "100",
        color: 'black',
    },
    modalContainer:{
        justifyContent: 'center',
        backgroundColor:'rgba(0, 0, 0, 0.8)',
        flex:1

    },
    innerContainer:{
        backgroundColor:'rgba(0, 0, 0, 0.5)',
        height:SCREEN_HEIGHT/2,
    },
    webView: {
        flex:1,
        borderRadius: 10,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor:'white',
        width:SCREEN_WIDTH,
        height:SCREEN_HEIGHT/2
    },
    sectionHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        backgroundColor: '#d4d4d4',
        height:30,
        marginTop:0,

    },
    sectionHeaderText: {
        fontSize: 15,
        color: '#424242',
        marginLeft: 10
    },

    closeContain:{
        backgroundColor:'gray',
        borderRadius: 100,
        width: 30,
        height: 30,
        borderWidth: 1,
        borderColor: '#FFF',
        alignItems: 'center',
        marginLeft: SCREEN_WIDTH-45
    },
    closeIcon:{
        right: 10,
        top:5,
        position:'absolute'
    },

});

module.exports = LocalList;
