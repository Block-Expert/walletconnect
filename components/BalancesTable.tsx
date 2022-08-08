import { Table } from '@gnosis.pm/safe-react-components';
import { TokenBalance, TokenInfo, TokenType } from '@gnosis.pm/safe-apps-sdk';
import BigNumber from 'bignumber.js';

const ethToken: TokenInfo = {
  address: '0x0000000000000',
  type: TokenType.NATIVE_TOKEN,
  logoUri: './eth.svg',
  symbol: 'ETH',
  name: 'Ether',
  decimals: 18,
};

const formatTokenValue = (value: number | string, decimals: number): string => {
  return new BigNumber(value).times(`1e-${decimals}`).toFixed();
};

const formatFiatValue = (value: string, currency: string): string => {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency }).format(parseFloat(value));
};

function Balances({ balances }: { balances: TokenBalance[] }) {
  return (
    <Table
      headers={[
        { id: 'col1', label: 'Asset' },
        { id: 'col2', label: 'Amount' },
        { id: 'col3', label: `Value, USD` },
      ]}
      rows={balances.map((item: TokenBalance, index: number) => {
        const token = item.tokenInfo.type === TokenType.NATIVE_TOKEN ? ethToken : item.tokenInfo;

        return {
          id: `row${index}`,
          cells: [
            {
              content: (
                <div style={{ display: 'flex', alignItems: 'center' }}>
                  <img src={token.logoUri || undefined} alt={`${token.symbol} Logo`} />
                  {token.name}
                </div>
              ),
            },

            { content: formatTokenValue(item.balance, token.decimals) },
            { content: formatFiatValue(item.fiatBalance, 'USD') },
          ],
        };
      })}
    />
  );
}

export default Balances;