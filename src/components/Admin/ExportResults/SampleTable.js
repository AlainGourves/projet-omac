const SampleTable = function () {

    return (
        <table>
            <thead>
                <tr>
                    <th></th>
                    <th colSpan="2">A</th>
                    <th colSpan="2">B</th>
                    <th>...</th>
                </tr>
            </thead>
            <tbody>
                <tr>
                    <td>item 1</td>
                    <td>x<sub>1</sub></td>
                    <td>y<sub>1</sub></td>
                    <td>x<sub>1</sub></td>
                    <td>y<sub>1</sub></td>
                    <td>...</td>
                </tr>
                <tr>
                    <td>item 2</td>
                    <td>x<sub>2</sub></td>
                    <td>y<sub>2</sub></td>
                    <td>x<sub>2</sub></td>
                    <td>y<sub>2</sub></td>
                    <td>...</td>
                </tr>
                <tr>
                    <td colSpan="6">...</td>
                </tr>
                <tr>
                    <td>durée</td>
                    <td>d<sub>A</sub></td>
                    <td>&nbsp;</td>
                    <td>d<sub>B</sub></td>
                    <td>&nbsp;</td>
                    <td>...</td>
                </tr>
            </tbody>
        </table>
    )
}

export default SampleTable;