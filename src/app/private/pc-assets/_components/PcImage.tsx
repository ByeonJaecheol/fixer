'use client';
import G3 from '../../../../../public/pcImage/G3.jpg'
import G5 from '../../../../../public/pcImage/G5.jpg'
import G7 from '../../../../../public/pcImage/G7.jpg'
import G8 from '../../../../../public/pcImage/G8.jpg'
import G10 from '../../../../../public/pcImage/G10.jpg'
import Z4G5 from '../../../../../public/pcImage/Z4G5.jpg'
import Z4G4 from '../../../../../public/pcImage/Z4G4.jpg'
import Z440 from '../../../../../public/pcImage/Z440.jpg'
import Z420 from '../../../../../public/pcImage/Z420.jpg'
import Z400 from '../../../../../public/pcImage/Z400.jpg'
import Z620 from '../../../../../public/pcImage/Z620.jpg'
import Z640 from '../../../../../public/pcImage/Z640.jpg'
import LG from '../../../../../public/pcImage/LG.jpg'
import { ComputerDesktopIcon } from '@heroicons/react/24/outline'
import Image, { StaticImageData } from 'next/image';
import { useEffect, useState } from 'react';

export default function PcImage({brand, pcType, modelName}: {brand: string, pcType: string, modelName: string}) { 
    const [image, setImage] = useState<StaticImageData | null>(null);
    useEffect(() => {
        getImage(brand, pcType, modelName)
    }, [brand, pcType, modelName])
    function getImage(brand: string, pcType: string, modelName: string) {
        if (brand === "HP") {
          if (pcType === "데스크탑") {
            if (modelName === "Z4G5") {
            setImage(Z4G5)
          } else if (modelName === "Z4G4") {
            setImage(Z4G4)
          } else if (modelName === "Z440") {
            setImage(Z440)
          } else if (modelName === "Z420") {
            setImage(Z420)
          } else if (modelName === "Z400") {
            setImage(Z400)
          } else if (modelName === "Z620") {
            setImage(Z620)
          } else if (modelName === "Z640") {
            setImage(Z640)
          }
        } else {
          if (modelName === "G3") {
            setImage(G3)
          } else if (modelName === "G5") {
            setImage(G5)
          } else if (modelName === "G7") {
            setImage(G7)
          } else if (modelName === "G8") {
            setImage(G8)
          } else if (modelName === "G10") {
            setImage(G10)
          }
        }
      }else if (brand === "LG") {
        setImage(LG);
      }else  {
        setImage(null);
      }
    }
  
    return (
        <>
            {image!==null ? (
                <Image
                src={image}
                alt={modelName}
                fill
                className="object-contain bg-white"
                />
            ):(
                <div className="flex items-center justify-center h-full text-gray-400">
                    <div className="flex justify-center mb-6">
                        <div className="relative">
                        <ComputerDesktopIcon className="h-20 w-20 text-blue-500 animate-pulse" />
                        </div>
                        <span className="text-sm text-gray-500">이미지 준비중입니다.</span>
                    </div>
                </div>
            ) }  
            
        </>
    )
}

