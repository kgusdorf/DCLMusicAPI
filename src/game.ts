export class AudioFollow {
  update() {
    let camPos = Camera.instance.position
    music.getComponent(Transform).position = new Vector3(camPos.x-7.5, camPos.y, camPos.z-2.5)
  }
}
engine.addSystem(new AudioFollow)

// Create screenspace component
const canvas = new UICanvas()

// const scrollableContainer = new UIScrollRect(canvas)
// scrollableContainer.width = '10%'
// scrollableContainer.height = '40%'
// scrollableContainer.valueX = 1
// scrollableContainer.backgroundColor = Color4.Gray()
// scrollableContainer.isVertical = true
// scrollableContainer.positionX = -400
// scrollableContainer.hAlign = "right"
// scrollableContainer.vAlign = "bottom"

let imageTexture = new Texture("images/buttons.png")
imageTexture.samplingMode = 1

const background = new UIImage(canvas, imageTexture)
background.width = 247
background.height = 264
background.positionX = -17
background.positionY = 17
background.sourceLeft = 0
background.sourceTop = 0
background.sourceWidth = 247
background.sourceHeight = 264
background.hAlign = "right"
background.vAlign = "bottom"

const rewindButton = new UIImage(background, imageTexture)
rewindButton.width = 37
rewindButton.height = 20
rewindButton.positionX = -50
rewindButton.positionY = 110
rewindButton.sourceLeft = 272
rewindButton.sourceTop = 53
rewindButton.sourceWidth = 37
rewindButton.sourceHeight = 20
rewindButton.isPointerBlocker = true
rewindButton.onClick = new OnClick(() => {
  stopButton.visible = true
  stopButton.isPointerBlocker = true
  playButton.visible = false
  playButton.isPointerBlocker = false
  switchSong(-1)
  updateSongList()
})

const forwardButton = new UIImage(background, imageTexture)
forwardButton.width = 37
forwardButton.height = 20
forwardButton.positionX = 50
forwardButton.positionY = 110
forwardButton.sourceLeft = 333
forwardButton.sourceTop = 53
forwardButton.sourceWidth = 37
forwardButton.sourceHeight = 20
forwardButton.isPointerBlocker = true
forwardButton.onClick = new OnClick(() => {
  stopButton.visible = true
  stopButton.isPointerBlocker = true
  playButton.visible = false
  playButton.isPointerBlocker = false
  switchSong(1)
  updateSongList()
})

const playButton = new UIImage(background, imageTexture)
playButton.width = 21
playButton.height = 21
playButton.positionX = 0
playButton.positionY = 110
playButton.sourceLeft = 352
playButton.sourceTop = 13
playButton.sourceWidth = 21
playButton.sourceHeight = 21
playButton.isPointerBlocker = true
playButton.onClick = new OnClick(() => {
  stopButton.visible = true
  stopButton.isPointerBlocker = true
  playButton.visible = false
  playButton.isPointerBlocker = false
  music.getComponent(AudioSource).playing = true
})

const stopButton = new UIImage(background, imageTexture)
stopButton.width = 21
stopButton.height = 21
stopButton.positionX = 0
stopButton.positionY = 110
stopButton.sourceLeft = 272
stopButton.sourceTop = 13
stopButton.sourceWidth = 21
stopButton.sourceHeight = 21
stopButton.visible = false
stopButton.isPointerBlocker = false
stopButton.onClick = new OnClick(() => {
  playButton.visible = true
  playButton.isPointerBlocker = true
  stopButton.visible = false
  stopButton.isPointerBlocker = false
  music.getComponent(AudioSource).playing = false
})

let currSong = 0

const currSongTitle = new UIText(background)
const currSongDesc = new UIText(background)

const queueTitleArray = []
const queueDescArray = []
for (let i = 0; i < 4; i++){
  queueTitleArray[i] = new UIText(background)
  queueDescArray[i] = new UIText(background)
}

function updateSongList(){
  executeTask(async () => {
    try {
      let response = await fetch("https://res.cloudinary.com/decentralgamesmusicapi/raw/upload/v1566180522/songs_ywigyx.json")
      let json = await response.json()
      log(json)
      
      currSongTitle.value = json[currSong].song
      currSongTitle.hTextAlign = "center"
      currSongTitle.positionX = 0
      currSongTitle.positionY = 90
      currSongTitle.fontSize = 16
      currSongTitle.isPointerBlocker = false

      currSongDesc.value = json[currSong].artist + " • " + json[currSong].album
      currSongDesc.hTextAlign = "center"
      currSongDesc.positionX = 0
      currSongDesc.positionY = 75
      currSongDesc.fontSize = 13
      currSongDesc.color = Color4.Gray()
      currSongDesc.isPointerBlocker = false

      for (let i = 0; i < json.length-1; i++){
        queueTitleArray[i].value = json[getSongPos(i+1)].song
        queueTitleArray[i].positionX = -50
        queueTitleArray[i].positionY = 40-40*i
        queueTitleArray[i].fontSize = 12
        queueTitleArray[i].isPointerBlocker = false
  
        queueDescArray[i].value = json[getSongPos(i+1)].artist + " • " + json[getSongPos(i+1)].album
        queueDescArray[i].positionX = -50
        queueDescArray[i].positionY = 40-40*i-15
        queueDescArray[i].fontSize = 11
        queueDescArray[i].color = Color4.Gray()
        queueDescArray[i].isPointerBlocker = false
      }
    } catch {
      log("failed to reach URL")
    }
  })
}

updateSongList()

const music = new Entity()
music.addComponent(new Transform())
let sourceList = []
for (let i = 0; i < 5; i++){
  sourceList[i] = new AudioSource(new AudioClip("sounds/song" + i + ".mp3"))
}
music.addComponent(sourceList[currSong])
engine.addEntity(music)

function switchSong(pos: number){
  // let songURL = "https://res.cloudinary.com/decentralgamesmusicapi/video/upload/v1566088607/Music/Virtual_Self_-_Ghost_Voices_zomfsr.mp3"
  music.removeComponent(AudioSource)
  currSong = getSongPos(pos)
  music.addComponent(sourceList[currSong])
  music.getComponent(AudioSource).playing = true
}

// Returns position of song in sourceList array depending on input
function getSongPos(pos: number){
  if (pos >= 1){
    let temp = currSong
    for (let i = 0; i < pos; i++){
      temp = temp == sourceList.length-1 ? 0 : temp+1;
    }
    return temp
  } else if (pos == -1){
    return currSong == 0 ? sourceList.length-1 : currSong-1;
  }
}