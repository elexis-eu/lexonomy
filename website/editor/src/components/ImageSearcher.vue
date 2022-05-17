<template>
  <div v-show="show" class="popup">
    <div ref="wrapper" class="modal" @click="maybeClosePopup">
      <div ref="modalContent" class="modal-content">
        <span class="close" @click="close">&times;</span>
          <div class="search-box">
              <input type="text" placeholder="Search images for" v-model="searchTerm">
              <button @click="getImages()">Search</button>
          </div>
        <div class="image-carousel">
          <div v-for="(image, i) of images" :key="i" class="image-holder">
            <img @click="selectImage(image)" :src="image">
          </div>
          <div class="loader-wrapper">
            <LoaderComponent v-if="gettingImagesInProcess"/>
          </div>

        </div>

      </div>
    </div>
  </div>
</template>

<script>
// import axios from "axios"
import LoaderComponent from "@/components/LoaderComponent"

export default {
  name: "ImageSearcher",
  components: {
    LoaderComponent
  },
  data() {
    return {
      show: false,
      searchTerm: "",
      images: [],
      continue: null,
      scrollListening: false,
      gettingImagesInProcess: false
    }
  },
  methods: {
    toggleOpen() {
      this.show = !this.show
    },
    close() {
      this.show = false
    },
    maybeClosePopup(event) {
      if (event.target === this.$refs.wrapper) {
        this.close()
      }
    },
    selectImage(imageUrl) {
      this.$emit('selected', imageUrl)
      this.close()
    },
    getImages() {
      this.gettingImagesInProcess = true
      if (!this.scrollListening) {
        this.scrollListening = true
        this.addScrollListener()
      }
      // let config = {
      //   headers: {
      //     "Access-Control-Allow-Origin": "*"
      //   }
      // }
      // axios
      //   .get(`https://en.wikipedia.org/w/api.php?action=query&format=json&list=allimages&aifrom=${this.searchTerm}&ailimit=3`, config)
      //   .then(response => {

      let response = {
        "batchcomplete": "",
        "continue": {"aicontinue": "Apple_Cider_Spider_Screenshot.png", "continue": "-||"},
        "query": {
          "allimages": [{
            "name": "Apple,_Skin_to_the_Core.jpeg",
            "timestamp": "2022-02-12T00:00:30Z",
            "url": "https://upload.wikimedia.org/wikipedia/en/2/29/Apple%2C_Skin_to_the_Core.jpeg",
            "descriptionurl": "https://en.wikipedia.org/wiki/File:Apple,_Skin_to_the_Core.jpeg",
            "descriptionshorturl": "https://en.wikipedia.org/w/index.php?curid=70047143",
            "ns": 6,
            "title": "File:Apple, Skin to the Core.jpeg"
          }, {
            "name": "Apple-calypseNowVHS.jpg",
            "timestamp": "2009-09-07T16:39:48Z",
            "url": "https://upload.wikimedia.org/wikipedia/en/d/df/Apple-calypseNowVHS.jpg",
            "descriptionurl": "https://en.wikipedia.org/wiki/File:Apple-calypseNowVHS.jpg",
            "descriptionshorturl": "https://en.wikipedia.org/w/index.php?curid=15183181",
            "ns": 6,
            "title": "File:Apple-calypseNowVHS.jpg"
          }, {
            "name": "Apple-hockey-puck-mouse.jpg",
            "timestamp": "2017-10-26T22:16:01Z",
            "url": "https://upload.wikimedia.org/wikipedia/en/b/ba/Apple-hockey-puck-mouse.jpg",
            "descriptionurl": "https://en.wikipedia.org/wiki/File:Apple-hockey-puck-mouse.jpg",
            "descriptionshorturl": "https://en.wikipedia.org/w/index.php?curid=25602218",
            "ns": 6,
            "title": "File:Apple-hockey-puck-mouse.jpg"
          }, {
            "name": "Apple-jack-video-game.jpg",
            "timestamp": "2011-03-25T02:57:53Z",
            "url": "https://upload.wikimedia.org/wikipedia/en/f/f3/Apple-jack-video-game.jpg",
            "descriptionurl": "https://en.wikipedia.org/wiki/File:Apple-jack-video-game.jpg",
            "descriptionshorturl": "https://en.wikipedia.org/w/index.php?curid=31290222",
            "ns": 6,
            "title": "File:Apple-jack-video-game.jpg"
          }, {
            "name": "AppleCard_iPhoneXS.png",
            "timestamp": "2019-03-27T21:46:35Z",
            "url": "https://upload.wikimedia.org/wikipedia/en/5/56/AppleCard_iPhoneXS.png",
            "descriptionurl": "https://en.wikipedia.org/wiki/File:AppleCard_iPhoneXS.png",
            "descriptionshorturl": "https://en.wikipedia.org/w/index.php?curid=60331869",
            "ns": 6,
            "title": "File:AppleCard iPhoneXS.png"
          }, {
            "name": "AppleCore_logo.jpeg",
            "timestamp": "2022-05-14T00:01:05Z",
            "url": "https://upload.wikimedia.org/wikipedia/en/4/43/AppleCore_logo.jpeg",
            "descriptionurl": "https://en.wikipedia.org/wiki/File:AppleCore_logo.jpeg",
            "descriptionshorturl": "https://en.wikipedia.org/w/index.php?curid=70774394",
            "ns": 6,
            "title": "File:AppleCore logo.jpeg"
          }, {
            "name": "AppleCrownPowercap.jpg",
            "timestamp": "2010-03-31T18:40:56Z",
            "url": "https://upload.wikimedia.org/wikipedia/en/5/52/AppleCrownPowercap.jpg",
            "descriptionurl": "https://en.wikipedia.org/wiki/File:AppleCrownPowercap.jpg",
            "descriptionshorturl": "https://en.wikipedia.org/w/index.php?curid=26777435",
            "ns": 6,
            "title": "File:AppleCrownPowercap.jpg"
          }, {
            "name": "AppleCtrl.jpg",
            "timestamp": "2007-05-16T17:10:48Z",
            "url": "https://upload.wikimedia.org/wikipedia/en/6/6a/AppleCtrl.jpg",
            "descriptionurl": "https://en.wikipedia.org/wiki/File:AppleCtrl.jpg",
            "descriptionshorturl": "https://en.wikipedia.org/w/index.php?curid=11258310",
            "ns": 6,
            "title": "File:AppleCtrl.jpg"
          }, {
            "name": "AppleFridayNightBaseball.jpg",
            "timestamp": "2022-04-15T05:35:48Z",
            "url": "https://upload.wikimedia.org/wikipedia/en/1/15/AppleFridayNightBaseball.jpg",
            "descriptionurl": "https://en.wikipedia.org/wiki/File:AppleFridayNightBaseball.jpg",
            "descriptionshorturl": "https://en.wikipedia.org/w/index.php?curid=70495961",
            "ns": 6,
            "title": "File:AppleFridayNightBaseball.jpg"
          }, {
            "name": "AppleIIGSOS.png",
            "timestamp": "2018-12-29T11:50:46Z",
            "url": "https://upload.wikimedia.org/wikipedia/en/0/0d/AppleIIGSOS.png",
            "descriptionurl": "https://en.wikipedia.org/wiki/File:AppleIIGSOS.png",
            "descriptionshorturl": "https://en.wikipedia.org/w/index.php?curid=3409475",
            "ns": 6,
            "title": "File:AppleIIGSOS.png"
          }, {
            "name": "AppleII_palette_lores_sample_image.png",
            "timestamp": "2020-11-18T04:46:13Z",
            "url": "https://upload.wikimedia.org/wikipedia/en/6/66/AppleII_palette_lores_sample_image.png",
            "descriptionurl": "https://en.wikipedia.org/wiki/File:AppleII_palette_lores_sample_image.png",
            "descriptionshorturl": "https://en.wikipedia.org/w/index.php?curid=65871059",
            "ns": 6,
            "title": "File:AppleII palette lores sample image.png"
          }, {
            "name": "AppleMusicUpNext.jpg",
            "timestamp": "2020-04-10T00:01:54Z",
            "url": "https://upload.wikimedia.org/wikipedia/en/4/44/AppleMusicUpNext.jpg",
            "descriptionurl": "https://en.wikipedia.org/wiki/File:AppleMusicUpNext.jpg",
            "descriptionshorturl": "https://en.wikipedia.org/w/index.php?curid=63609223",
            "ns": 6,
            "title": "File:AppleMusicUpNext.jpg"
          }, {
            "name": "AppleSac_ColcaSac_\u201ehempside\u201c.gif",
            "timestamp": "2007-03-14T02:56:17Z",
            "url": "https://upload.wikimedia.org/wikipedia/en/b/bf/AppleSac_ColcaSac_%E2%80%9Ehempside%E2%80%9C.gif",
            "descriptionurl": "https://en.wikipedia.org/wiki/File:AppleSac_ColcaSac_%E2%80%9Ehempside%E2%80%9C.gif",
            "descriptionshorturl": "https://en.wikipedia.org/w/index.php?curid=10043555",
            "ns": 6,
            "title": "File:AppleSac ColcaSac \u201ehempside\u201c.gif"
          }, {
            "name": "AppleScript_Editor.png",
            "timestamp": "2022-03-15T01:55:08Z",
            "url": "https://upload.wikimedia.org/wikipedia/en/2/23/AppleScript_Editor.png",
            "descriptionurl": "https://en.wikipedia.org/wiki/File:AppleScript_Editor.png",
            "descriptionshorturl": "https://en.wikipedia.org/w/index.php?curid=32297136",
            "ns": 6,
            "title": "File:AppleScript Editor.png"
          }, {
            "name": "AppleScript_Editor_Logo.png",
            "timestamp": "2020-11-17T07:06:36Z",
            "url": "https://upload.wikimedia.org/wikipedia/en/9/9e/AppleScript_Editor_Logo.png",
            "descriptionurl": "https://en.wikipedia.org/wiki/File:AppleScript_Editor_Logo.png",
            "descriptionshorturl": "https://en.wikipedia.org/w/index.php?curid=20490803",
            "ns": 6,
            "title": "File:AppleScript Editor Logo.png"
          }, {
            "name": "AppleShare_IP_Migration_screenshot.png",
            "timestamp": "2009-09-07T21:46:34Z",
            "url": "https://upload.wikimedia.org/wikipedia/en/f/fa/AppleShare_IP_Migration_screenshot.png",
            "descriptionurl": "https://en.wikipedia.org/wiki/File:AppleShare_IP_Migration_screenshot.png",
            "descriptionshorturl": "https://en.wikipedia.org/w/index.php?curid=4460456",
            "ns": 6,
            "title": "File:AppleShare IP Migration screenshot.png"
          }, {
            "name": "AppleSubmisionPrimaryScreen.jpg",
            "timestamp": "2009-05-20T12:51:05Z",
            "url": "https://upload.wikimedia.org/wikipedia/en/4/42/AppleSubmisionPrimaryScreen.jpg",
            "descriptionurl": "https://en.wikipedia.org/wiki/File:AppleSubmisionPrimaryScreen.jpg",
            "descriptionshorturl": "https://en.wikipedia.org/w/index.php?curid=22873375",
            "ns": 6,
            "title": "File:AppleSubmisionPrimaryScreen.jpg"
          }, {
            "name": "AppleTalk_logo_from_Control_Panel.gif",
            "timestamp": "2015-01-21T14:55:33Z",
            "url": "https://upload.wikimedia.org/wikipedia/en/8/86/AppleTalk_logo_from_Control_Panel.gif",
            "descriptionurl": "https://en.wikipedia.org/wiki/File:AppleTalk_logo_from_Control_Panel.gif",
            "descriptionshorturl": "https://en.wikipedia.org/w/index.php?curid=45152073",
            "ns": 6,
            "title": "File:AppleTalk logo from Control Panel.gif"
          }, {
            "name": "Apple_&_Onion_logo.svg",
            "timestamp": "2018-02-15T22:21:31Z",
            "url": "https://upload.wikimedia.org/wikipedia/en/1/1c/Apple_%26_Onion_logo.svg",
            "descriptionurl": "https://en.wikipedia.org/wiki/File:Apple_%26_Onion_logo.svg",
            "descriptionshorturl": "https://en.wikipedia.org/w/index.php?curid=56598705",
            "ns": 6,
            "title": "File:Apple & Onion logo.svg"
          }, {
            "name": "Apple_20_sleeve.jpg",
            "timestamp": "2009-02-20T19:35:37Z",
            "url": "https://upload.wikimedia.org/wikipedia/en/9/93/Apple_20_sleeve.jpg",
            "descriptionurl": "https://en.wikipedia.org/wiki/File:Apple_20_sleeve.jpg",
            "descriptionshorturl": "https://en.wikipedia.org/w/index.php?curid=17203565",
            "ns": 6,
            "title": "File:Apple 20 sleeve.jpg"
          }, {
            "name": "Apple_40_sleeve.jpg",
            "timestamp": "2009-10-13T03:23:20Z",
            "url": "https://upload.wikimedia.org/wikipedia/en/c/c4/Apple_40_sleeve.jpg",
            "descriptionurl": "https://en.wikipedia.org/wiki/File:Apple_40_sleeve.jpg",
            "descriptionshorturl": "https://en.wikipedia.org/w/index.php?curid=17202322",
            "ns": 6,
            "title": "File:Apple 40 sleeve.jpg"
          }, {
            "name": "Apple_AirPower.jpg",
            "timestamp": "2018-01-09T22:04:50Z",
            "url": "https://upload.wikimedia.org/wikipedia/en/9/93/Apple_AirPower.jpg",
            "descriptionurl": "https://en.wikipedia.org/wiki/File:Apple_AirPower.jpg",
            "descriptionshorturl": "https://en.wikipedia.org/w/index.php?curid=55743628",
            "ns": 6,
            "title": "File:Apple AirPower.jpg"
          }, {
            "name": "Apple_Aperture.jpg",
            "timestamp": "2015-06-30T06:12:45Z",
            "url": "https://upload.wikimedia.org/wikipedia/en/3/36/Apple_Aperture.jpg",
            "descriptionurl": "https://en.wikipedia.org/wiki/File:Apple_Aperture.jpg",
            "descriptionshorturl": "https://en.wikipedia.org/w/index.php?curid=15168883",
            "ns": 6,
            "title": "File:Apple Aperture.jpg"
          }, {
            "name": "Apple_Blossom_Festival_Logo.png",
            "timestamp": "2012-06-30T15:51:51Z",
            "url": "https://upload.wikimedia.org/wikipedia/en/c/cb/Apple_Blossom_Festival_Logo.png",
            "descriptionurl": "https://en.wikipedia.org/wiki/File:Apple_Blossom_Festival_Logo.png",
            "descriptionshorturl": "https://en.wikipedia.org/w/index.php?curid=36289750",
            "ns": 6,
            "title": "File:Apple Blossom Festival Logo.png"
          }, {
            "name": "Apple_Bonjour_Icon.png",
            "timestamp": "2014-12-20T06:04:46Z",
            "url": "https://upload.wikimedia.org/wikipedia/en/9/91/Apple_Bonjour_Icon.png",
            "descriptionurl": "https://en.wikipedia.org/wiki/File:Apple_Bonjour_Icon.png",
            "descriptionshorturl": "https://en.wikipedia.org/w/index.php?curid=20629610",
            "ns": 6,
            "title": "File:Apple Bonjour Icon.png"
          }, {
            "name": "Apple_Books_icon.png",
            "timestamp": "2022-03-15T05:06:16Z",
            "url": "https://upload.wikimedia.org/wikipedia/en/7/7d/Apple_Books_icon.png",
            "descriptionurl": "https://en.wikipedia.org/wiki/File:Apple_Books_icon.png",
            "descriptionshorturl": "https://en.wikipedia.org/w/index.php?curid=70314309",
            "ns": 6,
            "title": "File:Apple Books icon.png"
          }, {
            "name": "Apple_Box.jpeg",
            "timestamp": "2012-01-31T00:54:28Z",
            "url": "https://upload.wikimedia.org/wikipedia/en/1/1a/Apple_Box.jpeg",
            "descriptionurl": "https://en.wikipedia.org/wiki/File:Apple_Box.jpeg",
            "descriptionshorturl": "https://en.wikipedia.org/w/index.php?curid=34550528",
            "ns": 6,
            "title": "File:Apple Box.jpeg"
          }, {
            "name": "Apple_Brown_Betty_(album).jpeg",
            "timestamp": "2012-01-31T00:58:46Z",
            "url": "https://upload.wikimedia.org/wikipedia/en/d/d1/Apple_Brown_Betty_%28album%29.jpeg",
            "descriptionurl": "https://en.wikipedia.org/wiki/File:Apple_Brown_Betty_(album).jpeg",
            "descriptionshorturl": "https://en.wikipedia.org/w/index.php?curid=34550564",
            "ns": 6,
            "title": "File:Apple Brown Betty (album).jpeg"
          }, {
            "name": "Apple_Bushel_by_Zelphics.jpg",
            "timestamp": "2006-12-30T09:24:45Z",
            "url": "https://upload.wikimedia.org/wikipedia/en/9/97/Apple_Bushel_by_Zelphics.jpg",
            "descriptionurl": "https://en.wikipedia.org/wiki/File:Apple_Bushel_by_Zelphics.jpg",
            "descriptionshorturl": "https://en.wikipedia.org/w/index.php?curid=8671019",
            "ns": 6,
            "title": "File:Apple Bushel by Zelphics.jpg"
          }, {
            "name": "Apple_Cider_Spider_Coverart.png",
            "timestamp": "2007-09-22T14:44:06Z",
            "url": "https://upload.wikimedia.org/wikipedia/en/5/58/Apple_Cider_Spider_Coverart.png",
            "descriptionurl": "https://en.wikipedia.org/wiki/File:Apple_Cider_Spider_Coverart.png",
            "descriptionshorturl": "https://en.wikipedia.org/w/index.php?curid=13387449",
            "ns": 6,
            "title": "File:Apple Cider Spider Coverart.png"
          }]
        }
      }
      this.continue = response.continue.aicontinue || null
      response.query.allimages.forEach(image => {
        this.images.push(image.url)
      })
      this.gettingImagesInProcess = false
      // })
      // .catch(e => {
      //   console.error(e)
      // })
    },
    getMoreImages() {
      if (this.gettingImagesInProcess) {
        return
      }
      if (this.continue) {
        this.gettingImagesInProcess = true
        setTimeout(() => {
          let response = {
            "batchcomplete": "", "continue": {"aicontinue": "Apple_NewtonOS.png", "continue": "-||"}, "query": {
              "allimages": [{
                "name": "Apple_Cider_Spider_Screenshot.png",
                "timestamp": "2017-06-01T00:59:18Z",
                "url": "https://upload.wikimedia.org/wikipedia/en/a/a9/Apple_Cider_Spider_Screenshot.png",
                "descriptionurl": "https://en.wikipedia.org/wiki/File:Apple_Cider_Spider_Screenshot.png",
                "descriptionshorturl": "https://en.wikipedia.org/w/index.php?curid=36089022",
                "ns": 6,
                "title": "File:Apple Cider Spider Screenshot.png"
              }, {
                "name": "Apple_Compresson_v4.5.png",
                "timestamp": "2020-12-04T17:00:32Z",
                "url": "https://upload.wikimedia.org/wikipedia/en/9/96/Apple_Compresson_v4.5.png",
                "descriptionurl": "https://en.wikipedia.org/wiki/File:Apple_Compresson_v4.5.png",
                "descriptionshorturl": "https://en.wikipedia.org/w/index.php?curid=65947850",
                "ns": 6,
                "title": "File:Apple Compresson v4.5.png"
              }, {
                "name": "Apple_Configurator_2_Screenshot.png",
                "timestamp": "2021-11-29T22:01:04Z",
                "url": "https://upload.wikimedia.org/wikipedia/en/b/bf/Apple_Configurator_2_Screenshot.png",
                "descriptionurl": "https://en.wikipedia.org/wiki/File:Apple_Configurator_2_Screenshot.png",
                "descriptionshorturl": "https://en.wikipedia.org/w/index.php?curid=57656147",
                "ns": 6,
                "title": "File:Apple Configurator 2 Screenshot.png"
              }, {
                "name": "Apple_Configurator_logo.png",
                "timestamp": "2021-12-01T00:00:32Z",
                "url": "https://upload.wikimedia.org/wikipedia/en/1/13/Apple_Configurator_logo.png",
                "descriptionurl": "https://en.wikipedia.org/wiki/File:Apple_Configurator_logo.png",
                "descriptionshorturl": "https://en.wikipedia.org/w/index.php?curid=41884051",
                "ns": 6,
                "title": "File:Apple Configurator logo.png"
              }, {
                "name": "Apple_Control_Center_icon.jpg",
                "timestamp": "2013-07-14T05:14:09Z",
                "url": "https://upload.wikimedia.org/wikipedia/en/c/cf/Apple_Control_Center_icon.jpg",
                "descriptionurl": "https://en.wikipedia.org/wiki/File:Apple_Control_Center_icon.jpg",
                "descriptionshorturl": "https://en.wikipedia.org/w/index.php?curid=40805470",
                "ns": 6,
                "title": "File:Apple Control Center icon.jpg"
              }, {
                "name": "Apple_Corps_logo.png",
                "timestamp": "2011-01-25T19:48:10Z",
                "url": "https://upload.wikimedia.org/wikipedia/en/e/e5/Apple_Corps_logo.png",
                "descriptionurl": "https://en.wikipedia.org/wiki/File:Apple_Corps_logo.png",
                "descriptionshorturl": "https://en.wikipedia.org/w/index.php?curid=30612870",
                "ns": 6,
                "title": "File:Apple Corps logo.png"
              }, {
                "name": "Apple_Crumble_by_Lime_Cordiale_and_Idris_Elba.webp",
                "timestamp": "2021-10-02T00:01:14Z",
                "url": "https://upload.wikimedia.org/wikipedia/en/2/2a/Apple_Crumble_by_Lime_Cordiale_and_Idris_Elba.webp",
                "descriptionurl": "https://en.wikipedia.org/wiki/File:Apple_Crumble_by_Lime_Cordiale_and_Idris_Elba.webp",
                "descriptionshorturl": "https://en.wikipedia.org/w/index.php?curid=68859638",
                "ns": 6,
                "title": "File:Apple Crumble by Lime Cordiale and Idris Elba.webp"
              }, {
                "name": "Apple_Daily_last_issue.png",
                "timestamp": "2021-06-24T00:01:04Z",
                "url": "https://upload.wikimedia.org/wikipedia/en/c/cb/Apple_Daily_last_issue.png",
                "descriptionurl": "https://en.wikipedia.org/wiki/File:Apple_Daily_last_issue.png",
                "descriptionshorturl": "https://en.wikipedia.org/w/index.php?curid=68026144",
                "ns": 6,
                "title": "File:Apple Daily last issue.png"
              }, {
                "name": "Apple_Daily_logo_(2020-09-13).svg",
                "timestamp": "2021-06-28T02:01:22Z",
                "url": "https://upload.wikimedia.org/wikipedia/en/9/98/Apple_Daily_logo_%282020-09-13%29.svg",
                "descriptionurl": "https://en.wikipedia.org/wiki/File:Apple_Daily_logo_(2020-09-13).svg",
                "descriptionshorturl": "https://en.wikipedia.org/w/index.php?curid=68065121",
                "ns": 6,
                "title": "File:Apple Daily logo (2020-09-13).svg"
              }, {
                "name": "Apple_Desktop_Bus_(icon).svg",
                "timestamp": "2006-06-18T11:54:36Z",
                "url": "https://upload.wikimedia.org/wikipedia/en/1/12/Apple_Desktop_Bus_%28icon%29.svg",
                "descriptionurl": "https://en.wikipedia.org/wiki/File:Apple_Desktop_Bus_(icon).svg",
                "descriptionshorturl": "https://en.wikipedia.org/w/index.php?curid=5611081",
                "ns": 6,
                "title": "File:Apple Desktop Bus (icon).svg"
              }, {
                "name": "Apple_Ethernet_Symbol.svg",
                "timestamp": "2021-06-20T18:19:22Z",
                "url": "https://upload.wikimedia.org/wikipedia/en/6/6f/Apple_Ethernet_Symbol.svg",
                "descriptionurl": "https://en.wikipedia.org/wiki/File:Apple_Ethernet_Symbol.svg",
                "descriptionshorturl": "https://en.wikipedia.org/w/index.php?curid=68002797",
                "ns": 6,
                "title": "File:Apple Ethernet Symbol.svg"
              }, {
                "name": "Apple_Eyes_by_Swoop.png",
                "timestamp": "2020-02-28T00:01:50Z",
                "url": "https://upload.wikimedia.org/wikipedia/en/1/13/Apple_Eyes_by_Swoop.png",
                "descriptionurl": "https://en.wikipedia.org/wiki/File:Apple_Eyes_by_Swoop.png",
                "descriptionshorturl": "https://en.wikipedia.org/w/index.php?curid=63213976",
                "ns": 6,
                "title": "File:Apple Eyes by Swoop.png"
              }, {
                "name": "Apple_Films.jpg",
                "timestamp": "2009-09-03T02:26:12Z",
                "url": "https://upload.wikimedia.org/wikipedia/en/b/b8/Apple_Films.jpg",
                "descriptionurl": "https://en.wikipedia.org/wiki/File:Apple_Films.jpg",
                "descriptionshorturl": "https://en.wikipedia.org/w/index.php?curid=4215860",
                "ns": 6,
                "title": "File:Apple Films.jpg"
              }, {
                "name": "Apple_Final_Cut_Pro_v10.5.png",
                "timestamp": "2020-12-04T17:00:48Z",
                "url": "https://upload.wikimedia.org/wikipedia/en/f/fd/Apple_Final_Cut_Pro_v10.5.png",
                "descriptionurl": "https://en.wikipedia.org/wiki/File:Apple_Final_Cut_Pro_v10.5.png",
                "descriptionshorturl": "https://en.wikipedia.org/w/index.php?curid=65947892",
                "ns": 6,
                "title": "File:Apple Final Cut Pro v10.5.png"
              }, {
                "name": "Apple_II_Phasor_-_Plastic_Forks.png",
                "timestamp": "2017-07-16T23:53:10Z",
                "url": "https://upload.wikimedia.org/wikipedia/en/7/79/Apple_II_Phasor_-_Plastic_Forks.png",
                "descriptionurl": "https://en.wikipedia.org/wiki/File:Apple_II_Phasor_-_Plastic_Forks.png",
                "descriptionshorturl": "https://en.wikipedia.org/w/index.php?curid=25248884",
                "ns": 6,
                "title": "File:Apple II Phasor - Plastic Forks.png"
              }, {
                "name": "Apple_II_Taxman.jpg",
                "timestamp": "2018-08-16T22:01:26Z",
                "url": "https://upload.wikimedia.org/wikipedia/en/2/29/Apple_II_Taxman.jpg",
                "descriptionurl": "https://en.wikipedia.org/wiki/File:Apple_II_Taxman.jpg",
                "descriptionshorturl": "https://en.wikipedia.org/w/index.php?curid=58159007",
                "ns": 6,
                "title": "File:Apple II Taxman.jpg"
              }, {
                "name": "Apple_Instruments_Icon.png",
                "timestamp": "2016-08-09T10:25:03Z",
                "url": "https://upload.wikimedia.org/wikipedia/en/4/4c/Apple_Instruments_Icon.png",
                "descriptionurl": "https://en.wikipedia.org/wiki/File:Apple_Instruments_Icon.png",
                "descriptionshorturl": "https://en.wikipedia.org/w/index.php?curid=19952628",
                "ns": 6,
                "title": "File:Apple Instruments Icon.png"
              }, {
                "name": "Apple_Iveys.JPG",
                "timestamp": "2009-09-03T02:35:41Z",
                "url": "https://upload.wikimedia.org/wikipedia/en/1/1b/Apple_Iveys.JPG",
                "descriptionurl": "https://en.wikipedia.org/wiki/File:Apple_Iveys.JPG",
                "descriptionshorturl": "https://en.wikipedia.org/w/index.php?curid=11633341",
                "ns": 6,
                "title": "File:Apple Iveys.JPG"
              }, {
                "name": "Apple_Lane,_role-playing_game_adventure.jpg",
                "timestamp": "2017-11-05T21:57:00Z",
                "url": "https://upload.wikimedia.org/wikipedia/en/e/e1/Apple_Lane%2C_role-playing_game_adventure.jpg",
                "descriptionurl": "https://en.wikipedia.org/wiki/File:Apple_Lane,_role-playing_game_adventure.jpg",
                "descriptionshorturl": "https://en.wikipedia.org/w/index.php?curid=55720143",
                "ns": 6,
                "title": "File:Apple Lane, role-playing game adventure.jpg"
              }, {
                "name": "Apple_Leisure_Group_logo.png",
                "timestamp": "2013-09-19T16:00:59Z",
                "url": "https://upload.wikimedia.org/wikipedia/en/6/6c/Apple_Leisure_Group_logo.png",
                "descriptionurl": "https://en.wikipedia.org/wiki/File:Apple_Leisure_Group_logo.png",
                "descriptionshorturl": "https://en.wikipedia.org/w/index.php?curid=40504285",
                "ns": 6,
                "title": "File:Apple Leisure Group logo.png"
              }, {
                "name": "Apple_Lisa_Office_System_3.1.png",
                "timestamp": "2017-03-21T01:37:03Z",
                "url": "https://upload.wikimedia.org/wikipedia/en/5/52/Apple_Lisa_Office_System_3.1.png",
                "descriptionurl": "https://en.wikipedia.org/wiki/File:Apple_Lisa_Office_System_3.1.png",
                "descriptionshorturl": "https://en.wikipedia.org/w/index.php?curid=25697215",
                "ns": 6,
                "title": "File:Apple Lisa Office System 3.1.png"
              }, {
                "name": "Apple_Logo_1998.jpg",
                "timestamp": "2017-03-07T17:56:46Z",
                "url": "https://upload.wikimedia.org/wikipedia/en/4/43/Apple_Logo_1998.jpg",
                "descriptionurl": "https://en.wikipedia.org/wiki/File:Apple_Logo_1998.jpg",
                "descriptionshorturl": "https://en.wikipedia.org/w/index.php?curid=53413471",
                "ns": 6,
                "title": "File:Apple Logo 1998.jpg"
              }, {
                "name": "Apple_Loops_Utility_Screenshot.png",
                "timestamp": "2009-09-07T16:38:20Z",
                "url": "https://upload.wikimedia.org/wikipedia/en/6/63/Apple_Loops_Utility_Screenshot.png",
                "descriptionurl": "https://en.wikipedia.org/wiki/File:Apple_Loops_Utility_Screenshot.png",
                "descriptionshorturl": "https://en.wikipedia.org/w/index.php?curid=15168884",
                "ns": 6,
                "title": "File:Apple Loops Utility Screenshot.png"
              }, {
                "name": "Apple_Macintosh_Desktop.png",
                "timestamp": "2021-07-19T09:28:51Z",
                "url": "https://upload.wikimedia.org/wikipedia/en/5/50/Apple_Macintosh_Desktop.png",
                "descriptionurl": "https://en.wikipedia.org/wiki/File:Apple_Macintosh_Desktop.png",
                "descriptionshorturl": "https://en.wikipedia.org/w/index.php?curid=1016513",
                "ns": 6,
                "title": "File:Apple Macintosh Desktop.png"
              }, {
                "name": "Apple_Magic_Keyboard_(logo).svg",
                "timestamp": "2021-05-29T17:36:18Z",
                "url": "https://upload.wikimedia.org/wikipedia/en/f/fe/Apple_Magic_Keyboard_%28logo%29.svg",
                "descriptionurl": "https://en.wikipedia.org/wiki/File:Apple_Magic_Keyboard_(logo).svg",
                "descriptionshorturl": "https://en.wikipedia.org/w/index.php?curid=67796380",
                "ns": 6,
                "title": "File:Apple Magic Keyboard (logo).svg"
              }, {
                "name": "Apple_Mail.png",
                "timestamp": "2022-03-15T04:54:23Z",
                "url": "https://upload.wikimedia.org/wikipedia/en/7/78/Apple_Mail.png",
                "descriptionurl": "https://en.wikipedia.org/wiki/File:Apple_Mail.png",
                "descriptionshorturl": "https://en.wikipedia.org/w/index.php?curid=19650907",
                "ns": 6,
                "title": "File:Apple Mail.png"
              }, {
                "name": "Apple_Maps_directions_interface.png",
                "timestamp": "2020-07-08T00:14:02Z",
                "url": "https://upload.wikimedia.org/wikipedia/en/e/e4/Apple_Maps_directions_interface.png",
                "descriptionurl": "https://en.wikipedia.org/wiki/File:Apple_Maps_directions_interface.png",
                "descriptionshorturl": "https://en.wikipedia.org/w/index.php?curid=49277756",
                "ns": 6,
                "title": "File:Apple Maps directions interface.png"
              }, {
                "name": "Apple_Mary_-_Mary_Worth_02-24-35.png",
                "timestamp": "2017-12-25T22:15:39Z",
                "url": "https://upload.wikimedia.org/wikipedia/en/e/e1/Apple_Mary_-_Mary_Worth_02-24-35.png",
                "descriptionurl": "https://en.wikipedia.org/wiki/File:Apple_Mary_-_Mary_Worth_02-24-35.png",
                "descriptionshorturl": "https://en.wikipedia.org/w/index.php?curid=48341979",
                "ns": 6,
                "title": "File:Apple Mary - Mary Worth 02-24-35.png"
              }, {
                "name": "Apple_Menu_Monterey.png",
                "timestamp": "2022-03-16T00:24:36Z",
                "url": "https://upload.wikimedia.org/wikipedia/en/8/86/Apple_Menu_Monterey.png",
                "descriptionurl": "https://en.wikipedia.org/wiki/File:Apple_Menu_Monterey.png",
                "descriptionshorturl": "https://en.wikipedia.org/w/index.php?curid=70320260",
                "ns": 6,
                "title": "File:Apple Menu Monterey.png"
              }, {
                "name": "Apple_Music_Presents_Tyler_The_Creator_album_cover.jpg",
                "timestamp": "2019-08-14T21:50:49Z",
                "url": "https://upload.wikimedia.org/wikipedia/en/c/c3/Apple_Music_Presents_Tyler_The_Creator_album_cover.jpg",
                "descriptionurl": "https://en.wikipedia.org/wiki/File:Apple_Music_Presents_Tyler_The_Creator_album_cover.jpg",
                "descriptionshorturl": "https://en.wikipedia.org/w/index.php?curid=61517093",
                "ns": 6,
                "title": "File:Apple Music Presents Tyler The Creator album cover.jpg"
              }]
            }
          }
          this.continue = (response.continue && response.continue.aicontinue) || null
          response.query.allimages.forEach(image => {
            this.images.push(image.url)
          })
          this.gettingImagesInProcess = false
        }, 3000)
      }
    },
    addScrollListener() {
      this.$refs.wrapper.onscroll = () => {
        let element = this.$refs.wrapper
        if (element.scrollTop + element.offsetHeight > this.$refs.modalContent.offsetHeight - 100) {
          this.getMoreImages()
        }
      }
    }
  }
}
</script>

<style lang="scss" scoped>

.popup {
  padding: 8px 16px;
  margin-bottom: 8px;

  .modal {
    display: block;
    position: fixed; /* Stay in place */
    z-index: 3; /* Sit on top */
    left: 0;
    top: 0;
    width: 100%; /* Full width */
    height: 100%; /* Full height */
    max-height: 100%;
    overflow: auto; /* Enable scroll if needed */
    background-color: rgb(0, 0, 0); /* Fallback color */
    background-color: rgba(0, 0, 0, 0.4); /* Black w/ opacity */
  }

  /* Modal Content/Box */
  .modal-content {
    background-color: #fefefe;
    margin: 15% auto; /* 15% from the top and centered */
    padding: 20px;
    border: 1px solid #888;
    width: 80%; /* Could be more or less, depending on screen size */
  }

  /* The Close Button */
  .close {
    color: #aaa;
    float: right;
    font-size: 28px;
    font-weight: bold;

    &:hover,
    &:focus {
      color: black;
      text-decoration: none;
      cursor: pointer;
    }
  }

  .search-box {
    display: flex;

    input {
      max-width: 400px;
      margin: 0;
    }

    button {
      margin: 0 16px;
    }
  }

  .image-carousel {
    display: flex;
    flex-direction: row;
    flex-flow: wrap;
    justify-content: space-between;
    margin: 20px;

    .image-holder {
      display: flex;
      width: 200px;
      height: 200px;
      margin: 10px 5px;
      justify-content: center;

      img {
        max-width: 100%;
        max-height: 100%;
        object-fit: contain;
        cursor: pointer;

        &:hover {
          filter: drop-shadow(2px 4px 6px black)
        }
      }
    }

    .loader-wrapper {
      position: relative;
      width: 100%;
      height: 30px;
      margin-top: 30px;
    }
  }
}
</style>
