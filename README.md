# m2s

This is a utility that grabs markers from an `.fcpxml` file and generates stills for each, naming each still (and changing its creation date) to match its timecode.  We typically install it globally:
```
npm i -g m2s
```
and then run it using the cli:
```
m2s /path/to/fcpxml [options]
```

## setup

Before you can start using the script, you need to set a couple of config variables, which you can do with the `--config` flag.  The bare minimum you need to do is set a desired output folder:
```
  m2s --config --outputDir=/path/to/directory
```
The script will look for `ffmpeg` in your PATH, and if it finds the command works, it will set `--ffmpegPath='ffmpeg'`. If your ffmpeg is elsewhere, you can manually set this variable.  If you don't have ffmpeg, install it with homebrew (`brew install ffmpeg`) or visit the [ffmpeg site](https://www.ffmpeg.org/).

Other variables you can set include
```
--html // create html displaying images and open
--relink // point to media folder for relinking
--pdf // coming soon
--jpg // coming soon
```

## use

You need to specify an `.fcpxml` file, and you need to make sure that that fcpxml file is pointed at the media (currently there's no way to relink from within this script).  If your media gets unlinked, go back into FCPX, relink the media, and generate a new `.fcpxml` file.

Type your command like so:

```
   m2s --fcpxml [path/to/your/fcpxml]
```

Your mileage may vary---this script breaks pretty easily.  Send any advice our way :)
