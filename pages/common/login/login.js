const network = require("../../../utils/main.js");
var md5 = require("../../../utils/md5.js");
var app = getApp();
// console.log(app);

Page({
    data: {
        base: '../../../',
        IMGURL: app.imgUrl,
        username: '',
        password: '',
        next: '',
        id: 0,
        good: 0,
        scid: 0,
        share: false
    },
    onLoad: function (options) {
      if(options.next!=undefined){
        this.setData({
          next: options.next,
          id: options.id,
          good: options.good,
          scid: options.scid
        });
      }
      
        network.getAllAdress();
    },
    userNameInput: function (e) {
        this.setData({
            username: e.detail.value.replace(/^\s*|\s*$/, '')
        })
    },
    passWordInput: function (e) {
        this.setData({
            password: e.detail.value.replace(/^\s*|\s*$/, '')
        })
    },
    loginBtnClick: function () {
        var that = this;
        var username = that.data.username;
        var password = that.data.password;

        if (username.length == 0 || password.length == 0) {
            wx.showToast({
                title: '不能为空',
                icon: 'none',
                duration: 1000
            })
        }
        else if (!(/^1(3|4|5|7|8)\d{9}$/.test(username))) {
            wx.showToast({
                title: '手机号不合法',
                icon: 'none',
                duration: 1000
            })
        }
        else {
            network.POST({
                url: 'v11/login/index',
                params: {
                    "mobile": username,
                    "password": md5.hexMD5(password),
                    "version_number": "0",
                    "lng": '',
                    "lat": '',
                    "login_source": 1
                },
                success: function (res) {
                    wx.hideLoading();
                    if (res.data.code == 200) {
                        var a = res.data.data[0];
                        wx.setStorage({
                            key: 'userInfo',
                            data: a
                        });
                        app.userInfo = a;
                      console.log('that.data.nextb: ', that.data.next)
                        if (a.step == 8) {
                          //登录后如果有分享跳到分享页面
                          console.log('that.data.next f: ',that.data.next)
                          if(that.data.next){
                            console.log('执行跳转');
                            //获取图片和标题
                            wx.request({
                              url: app.requestUrl + 'v14/chinese/poetryinfo', //仅为示例，并非真实的接口地址
                              header: {
                                'content-type': 'application/x-www-form-urlencoded' // 默认值
                              },
                              method: 'POST',
                              data: {
                                "token": app.userInfo.token,
                                "mobile": app.userInfo.mobile,
                                "app_source_type": app.app_source_type,
                                "read_id": that.data.scid

                              },
                              success(res) {
                                var image = res.data.data[0].item.imgUrl;
                                var name = res.data.data[0].item.rname;
                                wx.setStorageSync("pic", res.data.data[0].item.imgUrl)
                                wx.setStorageSync("rname", res.data.data[0].item.rname)
                                //
                                wx.navigateTo({
                                  url: "/" + `${that.data.next}?id=${that.data.id}&good=${that.data.good}&scid=${that.data.scid}`,
                                })
                              }
                            })
                            
                          } else {
                            //
                            wx.switchTab({
                              url: '/pages/main/pages/Shopdetails/Shopdetails'
                            });
                          }
                          
                        } else {
                            // wx.navigateTo({
                            //     url: '/pages/common/presonalInfo/presonalInfo'
                            // });
                            //登录后直接进入
                          var name = (app.userInfo.mobile).substring(7, 11);
                          network.POST({
                            url: 'v14/user-info/update',
                            params: {
                              "mobile": app.userInfo.mobile,
                              "token": app.userInfo.token,
                              "nickname": name,
                              "sex": 2,
                              "province_id": 6,
                              "city_id": 37,
                              "district_id": 430,
                              "schoolid": 20941,
                              "gradeid": 1,
                              "classid": 1
                            },
                            success: function (res) {
                              wx.hideLoading();
                              console.log(res)
                              if (res.data.code == 200) {
                                // that.saveInfo(name);
                                wx.navigateTo({
                                  url: '/pages/main/pages/Shopdetails/Shopdetails'
                                })
                              } else {
                                wx.showToast({
                                  title: res.data.message,
                                  icon: 'none',
                                  duration: 1000
                                })
                              }
                            },
                            fail: function () {
                              wx.hideLoading();
                              wx.showToast({
                                title: '服务器异常',
                                icon: 'none',
                                duration: 1000
                              })
                            }
                          });
                        }
                    } else {
                        wx.showToast({
                            title: res.data.message,
                            icon: 'none',
                            duration: 1000
                        })
                    }
                },
                fail: function () {
                    wx.hideLoading();
                    wx.showToast({
                        title: '服务器异常',
                        icon: 'none',
                        duration: 1000
                    })
                }
            })
        }
    },
    tz_forget: function (options) {
        wx.navigateTo({
            url: '/pages/common/forget_password/forget_password'
        })
    },
    tz_register: function (options) {
        wx.navigateTo({
            url: '/pages/common/register/register'
        })
    },
  onShow: function () {
  //
    if(this.data.share){
      wx.switchTab({
        url: '/pages/main/pages/Shopdetails/Shopdetails'
      });
    }
  },
  onHide: function(){
    //
    this.setData({
      share: true
    })
  }
})