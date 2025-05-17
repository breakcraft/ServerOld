import Packet from '#/io/Packet.js';
import MessageEncoder from '#/network/game/server/codec/MessageEncoder.js';
import ServerProt225 from '#/network/game/server/codec/rs225/ServerProt225.js';
import UpdateSpecialEnergy from '#/network/game/server/model/UpdateSpecialEnergy.js';

export default class UpdateSpecialEnergyEncoder extends MessageEncoder<UpdateSpecialEnergy> {
    prot = ServerProt225.UPDATE_SPECENERGY;

    encode(buf: Packet, message: UpdateSpecialEnergy): void {
        buf.p1((message.energy / 100) | 0);
    }
}
