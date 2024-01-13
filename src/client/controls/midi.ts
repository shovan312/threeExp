import * as Tone from 'tone';
import {Header, Midi, Track} from "@tonejs/midi";
import {TimeSignatureEvent} from "@tonejs/midi/dist/Header";

export function loadMidi( path:string):Promise<Midi>{
    return new Promise(function( resolve, reject ){
        Midi.fromUrl(path).then(
            resolve, reject
        )
    });
}

export class MidiController {
    midi:Midi
    header:Header
    ppq:number
    tempo:number
    mpt:number
    ticksPerMilli:number=0
    lowestNote:number
    highestNote:number
    timeSignatures:TimeSignatureEvent[]
    ts:number
    trackCursors:number[]=[]

    constructor(midiJson:Midi) {
        this.midi = midiJson
        this.twoX(midiJson);
        this.header = midiJson.header
        let mH = this.header
        this.ppq = mH.ppq
        this.timeSignatures = mH.timeSignatures
        this.ts = this.timeSignatures.length > 0 ? this.timeSignatures[0].timeSignature[0] : 4

        this.tempo = mH.tempos.length > 0 ? mH.tempos[0].bpm : 120
        this.mpt = (this.ppq*this.tempo)/(60*1000)
        this.mpt = this.mpt**(-1)
        let ret = this.getLimits(midiJson)

        this.lowestNote = ret[0]
        this.highestNote = ret[1]

        for(let i in midiJson.tracks) {
            this.trackCursors.push(0)
        }
    }

    twoX(mJson:Midi) {
        for(let i in mJson.tracks) {
            for(let j in mJson.tracks[i].notes) {
                let mN = mJson.tracks[i].notes[j]
                mN.duration /= 2
                mN.durationTicks /= 2
                mN.ticks /= 2
            }
            //@ts-ignore
            (mJson.tracks[i] as Track).endOfTrackTicks /= 2
        }
    }

    getLimits(mJson:Midi) {
        let lowestNote = 1000, highestNote = 0
        for(let i in mJson.tracks) {
            for(let j in mJson.tracks[i].notes) {
                let mN = mJson.tracks[i].notes[j].midi
                lowestNote = Math.min(lowestNote, mN)
                highestNote = Math.max(highestNote, mN)
            }
        }
        return [lowestNote, highestNote]
    }

    updateCursor(time:number, midiKeysPressed:any) {
        for(let i=0; i < this.midi.tracks.length; i++) {
            time *= 1000
            let track = this.midi.tracks[i]
            if (this.mpt*(track.endOfTrackTicks as number) < time) {
                midiKeysPressed[i] = {}
                continue;
            }


            let notes = track.notes
            for(let j=this.trackCursors[i]; j < notes.length ; j++) {
                if (time > this.mpt*notes[j].ticks && time < this.mpt*(notes[j].ticks + notes[j].durationTicks)) {
                    midiKeysPressed[i][notes[j].midi] = true
                    this.trackCursors[i] = j
                }
                else if (j < notes.length - 1 &&
                time > this.mpt*(notes[j].ticks + notes[j].durationTicks) &&
                time < this.mpt*notes[j+1].ticks) {
                    delete midiKeysPressed[i][notes[j].midi]
                }
            }

        }
    }
}




