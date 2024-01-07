import {coefficient} from "./spiro";
import {complex} from "ts-complex-numbers";

export const complexCoeff0:Array<coefficient> = [
    {n:3, an:new complex(10, 8/3)},
    {n:-1, an:new complex(8,0)},
    {n:-9, an:new complex(4,10/3)},
    {n:13, an:new complex(5/3, 2/3)},
    // {n:-29, an:new complex(0.8, 0)},
    // {n:49, an:new complex(0.1, 0.2)}
]

export const complexCoeff:Array<coefficient> = [
    {n:4, an:new complex(10, 8/3)},
    {n:-1, an:new complex(4,0)},
    {n:9, an:new complex(2,10/3)},
    {n:-11, an:new complex(5/3, 2/3)},
    {n:20, an:new complex(1/3, 0)},
    // {n:-9, an:new complex(0.8, 0)},
    // {n:49, an:new complex(0.1, 0.2)}
]

export const zeroCoeff:Array<coefficient> = [
    {n:0, an:new complex(0,0)}
    // {n:4, an:new complex(6, 0)},
    // {n:2, an:new complex(6, 0)},
]

export const simpleCoeff:Array<coefficient> = [
    {n:-1, an:new complex(10, 0)},
    {n:3, an:new complex(1,0)},
    {n:5, an:new complex(5, -1)}
]

export const squareCoeff:Array<coefficient> = [
    {n:-7, an:new complex(-0.0827113100467,0)},
    {n:-3, an:new complex(-0.4503171322,0)},
    {n:1, an:new complex(-4.0528541922,0)},
    {n:5, an:new complex(-0.16211416769,0)},
    {n:9, an:new complex(-0.05003523694,0)},
]

export const clockCoeff:Array<coefficient> = [
    {n: 1, an: new complex(16, 0)},
    {n: -3, an: new complex(10, 0)},
    {n: 9, an: new complex(8, 0)},
    {n: -27, an: new complex(2, 0)},
    {n: -2, an: new complex(3, 0)},
]
