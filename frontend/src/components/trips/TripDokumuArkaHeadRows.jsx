export default function TripDokumuArkaHeadRows() {
  return (
    <>
      <tr>
        <td rowSpan={2} className="dokumu-head">
          SIRA NO
        </td>
        <td rowSpan={2} className="dokumu-head dokumu-col-makbuz">
          TAHSİLAT
          <br />
          MAKBUZ NO
        </td>
        <td colSpan={2} className="dokumu-head">
          MİKRO KAY.NO:
        </td>
        <td rowSpan={2} className="dokumu-head">
          ÜNVANI
        </td>
        <td rowSpan={2} className="dokumu-head">
          TARİH
        </td>
        <td className="dokumu-head">NAKİT</td>
        <td colSpan={2} className="dokumu-head">
          SENET
        </td>
        <td colSpan={3} className="dokumu-head">
          ÇEK
        </td>
        <td colSpan={2} className="dokumu-head">
          MAİLORDER / KREDİ KARTI
        </td>
        <td colSpan={2} className="dokumu-head">
          HAVALE
        </td>
        <td className="dokumu-head">POS</td>
        <td className="dokumu-head">POS</td>
      </tr>
      <tr>
        <td className="dokumu-head">SR.</td>
        <td className="dokumu-head">NO</td>
        <td className="dokumu-head">TUTARI</td>
        <td className="dokumu-head">VADE TARİHİ</td>
        <td className="dokumu-head">TUTARI</td>
        <td className="dokumu-head">BANKA ADI</td>
        <td className="dokumu-head">VADE</td>
        <td className="dokumu-head">TUTARI</td>
        <td className="dokumu-head">FİRMA</td>
        <td className="dokumu-head">TUTAR</td>
        <td className="dokumu-head">BANKA</td>
        <td className="dokumu-head">TUTARI</td>
        <td className="dokumu-head">YKB</td>
        <td className="dokumu-head">TEB</td>
      </tr>
    </>
  );
}
