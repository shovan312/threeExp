import {coefficient} from "./spiro";
import {complex} from "ts-complex-numbers";

export const complexCoeff:Array<coefficient> = [
    {n:3, an:new complex(10, 8/3)},
    {n:-1, an:new complex(8,0)},
    {n:-7, an:new complex(4,10/3)},
    {n:13, an:new complex(5/3, 2/3)},
    {n:-29, an:new complex(0.8, 0)},
    {n:49, an:new complex(0.1, 0.2)}
]

export const simpleCoeff:Array<coefficient> = [
    {n:1, an:new complex(10, 0)},
    {n:6, an:new complex(1,0)},
    {n:-14, an:new complex(0,0)},
]

export const squareCoeff:Array<coefficient> = [
    {n:-7, an:new complex(-0.0827113100467,0)},
    {n:-3, an:new complex(-0.4503171322,0)},
    {n:1, an:new complex(-4.0528541922,0)},
    {n:5, an:new complex(-0.16211416769,0)},
    {n:9, an:new complex(-0.05003523694,0)},
]
